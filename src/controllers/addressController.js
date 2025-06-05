const Address = require('../models/addressModel');
const User = require('../models/userModel');

// Get all addresses of logged-in user
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Add a new address
exports.addAddress = async (req, res) => {
  try {
    // If it's default, unset existing default addresses
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    const address = new Address({
      ...req.body,
      user: req.user._id,
    });

    await address.save();

    // Optional: Push to user's address array
    const user = await User.findById(req.user._id);
    user.addresses.push(address._id);
    await user.save();

    res.status(201).json(address);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // If new address is default, unset previous ones
    if (req.body.isDefault) {
      await Address.updateMany(
        { user: req.user._id },
        { $set: { isDefault: false } }
      );
    }

    Object.assign(address, req.body);
    await address.save();

    res.json(address);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // Optional: Remove from user's array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: req.params.addressId }
    });

    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// Set a specific address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.addressId;

    // Check if address exists and belongs to the user
    const address = await Address.findOne({ _id: addressId, user: req.user._id });
    if (!address) return res.status(404).json({ message: 'Address not found' });

    // Unset current default addresses
    await Address.updateMany(
      { user: req.user._id },
      { $set: { isDefault: false } }
    );

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.json({ message: 'Default address set successfully', address });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


