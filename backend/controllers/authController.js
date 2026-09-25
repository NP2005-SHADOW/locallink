const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const nodemailer = require('nodemailer');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role, category, service } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'Customer',
      category: role === 'Provider' ? category : undefined,
      service: role === 'Provider' ? service : undefined,
      verificationStatus: 'Pending',
      phoneVerified: false,
      documentData: undefined 
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secretkey', {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        category: newUser.category,
        service: newUser.service,
        verificationStatus: newUser.verificationStatus,
        phoneVerified: newUser.phoneVerified,
        documentData: newUser.documentData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // BYPASS CHECK: If the provider is already Approved by an admin, 
    // automatically mark them fully verified so they never see OTP/KYC screens again.
    if (user.role === 'Provider' && user.verificationStatus === 'Approved') {
      user.emailVerified = true;
      user.phoneVerified = true;
      await user.save();
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        category: user.category,
        service: user.service,
        verificationStatus: user.verificationStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        documentData: user.documentData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

exports.sendEmailOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOtp = otp;
    user.emailOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your LocalLink Verification Code',
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.emailOtp || user.emailOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (Date.now() > user.emailOtpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.emailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;

    if (user.role === 'Provider' && user.documentData) {
      user.verificationStatus = 'Submitted';
    }

    await user.save();
    res.status(200).json({ 
      message: 'Email verified successfully!',
      verificationStatus: user.verificationStatus 
    });
  } catch (error) {
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

exports.sendPhoneOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.phoneOtp = otp;
    user.phoneOtpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    let formattedPhone = user.phone;
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }

    console.log(`\n========================================`);
    console.log(`📱 SMS / PHONE TO: ${formattedPhone}`);
    console.log(`🔑 YOUR PHONE OTP IS: ${otp}`);
    console.log(`========================================\n`);

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        await client.messages.create({
          body: `Your LocalLink Verification Code is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      } catch (twilioErr) {
        console.log('⚠️ Twilio SMS failed (Trial account restriction). Using terminal OTP instead.');
      }
    }

    res.status(200).json({ message: 'Phone OTP sent successfully' });
  } catch (error) {
    console.error('Phone OTP Error:', error);
    res.status(500).json({ message: 'Failed to send SMS OTP.', error: error.message });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.phoneOtp || user.phoneOtp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    if (Date.now() > user.phoneOtpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    user.phoneVerified = true;
    user.phoneOtp = undefined;
    user.phoneOtpExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: 'Phone verified successfully!',
      phoneVerified: user.phoneVerified 
    });
  } catch (error) {
    res.status(500).json({ message: 'Phone verification failed', error: error.message });
  }
};

exports.uploadKyc = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.phoneVerified || !user.emailVerified) {
      return res.status(400).json({ message: 'Please complete phone and email verification before uploading KYC documents.' });
    }

    if (!req.file) return res.status(400).json({ message: 'No document file provided' });

    user.documentData = req.file.path;
    user.verificationStatus = 'Submitted';
    await user.save();

    res.status(200).json({
      message: 'KYC document uploaded successfully!',
      provider: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        category: user.category,
        service: user.service,
        verificationStatus: user.verificationStatus,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        documentData: user.documentData
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload document', error: error.message });
  }
};