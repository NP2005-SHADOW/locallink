const User = require('../models/User');

exports.searchProviders = async (req, res) => {
  try {
    const { category, service } = req.query;
    
    // Build the search query, restricting to approved providers only
    let query = { 
      role: 'Provider', 
      verificationStatus: 'Approved' // <-- THIS ENSURES UNVERIFIED PROVIDERS ARE HIDDEN
    };
    
    if (category) query.category = category;
    if (service) query.service = service;

    // Find providers and exclude their passwords from the result
    const providers = await User.find(query).select('-password');
    
    res.status(200).json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching providers', error: error.message });
  }
};