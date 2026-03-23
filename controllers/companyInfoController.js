const CompanyInfo = require('../models/CompanyInfo');

const getOrCreate = async () => {
  let info = await CompanyInfo.findOne();
  if (!info) info = await CompanyInfo.create({});
  return info;
};

// @desc  Get company info (public)
// @route GET /api/company-info
// @access Public
exports.getCompanyInfo = async (req, res) => {
  try {
    const info = await getOrCreate();
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update company info (admin)
// @route PUT /api/company-info
// @access Private
exports.updateCompanyInfo = async (req, res) => {
  try {
    const scalarFields = [
      'companyName', 'tagline', 'aboutText', 'rcNumber', 'foundedYear',
      'phone', 'phoneSecondary', 'email', 'emailSupport',
      'workingDays', 'workingHours',
      'facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'whatsapp',
    ];

    const updateData = {};
    scalarFields.forEach(key => {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    });

    // Handle addresses array
    if (req.body.addresses !== undefined) {
      if (!Array.isArray(req.body.addresses)) {
        return res.status(400).json({ success: false, message: 'Addresses must be an array.' });
      }
      if (req.body.addresses.length > 3) {
        return res.status(400).json({ success: false, message: 'Maximum of 3 addresses allowed.' });
      }
      // Assign order by array position
      updateData.addresses = req.body.addresses.map((addr, i) => ({ ...addr, order: i }));
    }

    let info = await CompanyInfo.findOne();
    if (!info) {
      info = await CompanyInfo.create(updateData);
    } else {
      info = await CompanyInfo.findByIdAndUpdate(info._id, updateData, { new: true, runValidators: true });
    }

    res.status(200).json({ success: true, message: 'Company information updated successfully', data: info });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
