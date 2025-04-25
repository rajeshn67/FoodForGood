const express = require("express")
const router = express.Router()
const Donation = require("../models/Donation")
const User = require("../models/User")
const auth = require("../middleware/auth")

// @route   POST api/donations
// @desc    Create a donation
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    // Check if user is a donor
    if (req.user.userType !== "donor") {
      return res.status(403).json({ msg: "Only donors can create donations" })
    }

    const { foodName, quantity, description, expiryDate, pickupAddress, pickupTime } = req.body

    const newDonation = new Donation({
      donorId: req.user.id,
      foodName,
      quantity,
      description,
      expiryDate,
      pickupAddress,
      pickupTime,
    })

    const donation = await newDonation.save()
    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/donations
// @desc    Get all donations (available for NGOs, own donations for donors)
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let donations

    if (req.user.userType === "donor") {
      // If donor, get only their donations
      donations = await Donation.find({ donorId: req.user.id }).sort({ createdAt: -1 })
    } else {
      // If NGO, get all available donations
      donations = await Donation.find({ status: "available" }).sort({ createdAt: -1 })
    }

    // Populate donor information
    const populatedDonations = await Promise.all(
      donations.map(async (donation) => {
        const donor = await User.findById(donation.donorId).select("fullName email phone")
        return {
          ...donation._doc,
          donor,
        }
      }),
    )

    res.json(populatedDonations)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/donations/claimed
// @desc    Get claimed donations for NGO
// @access  Private
router.get("/claimed", auth, async (req, res) => {
  try {
    // Check if user is an NGO
    if (req.user.userType !== "ngo") {
      return res.status(403).json({ msg: "Not authorized" })
    }

    // Get donations claimed by this NGO
    const donations = await Donation.find({
      claimedBy: req.user.id,
      status: { $in: ["claimed", "completed"] },
    }).sort({ createdAt: -1 })

    // Populate donor information
    const populatedDonations = await Promise.all(
      donations.map(async (donation) => {
        const donor = await User.findById(donation.donorId).select("fullName email phone")
        return {
          ...donation._doc,
          donor,
        }
      }),
    )

    res.json(populatedDonations)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    // Get donor information
    const donor = await User.findById(donation.donorId).select("fullName email phone")

    // If donation is claimed, get claimer information
    let claimedBy = null
    if (donation.claimedBy) {
      claimedBy = await User.findById(donation.claimedBy).select("fullName email phone")
    }

    res.json({
      ...donation._doc,
      donor,
      claimedBy,
    })
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Donation not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   PUT api/donations/:id
// @desc    Update a donation
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id)

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    // Check if user is the donor who created the donation
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }

    // Check if donation is already claimed
    if (donation.status !== "available") {
      return res.status(400).json({ msg: "Cannot update a claimed donation" })
    }

    // Update donation
    const { foodName, quantity, description, expiryDate, pickupAddress, pickupTime } = req.body

    donation = await Donation.findByIdAndUpdate(
      req.params.id,
      {
        foodName,
        quantity,
        description,
        expiryDate,
        pickupAddress,
        pickupTime,
      },
      { new: true },
    )

    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   DELETE api/donations/:id
// @desc    Delete a donation
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    // Check if user is the donor who created the donation
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }

    // Check if donation is already claimed
    if (donation.status !== "available") {
      return res.status(400).json({ msg: "Cannot delete a claimed donation" })
    }

    await donation.deleteOne()
    res.json({ msg: "Donation removed" })
  } catch (err) {
    console.error(err.message)
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Donation not found" })
    }
    res.status(500).send("Server error")
  }
})

// @route   PUT api/donations/:id/claim
// @desc    Claim a donation (NGO only)
// @access  Private
router.put("/:id/claim", auth, async (req, res) => {
  try {
    // Check if user is an NGO
    if (req.user.userType !== "ngo") {
      return res.status(403).json({ msg: "Only NGOs can claim donations" })
    }

    const donation = await Donation.findById(req.params.id)

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    if (donation.status !== "available") {
      return res.status(400).json({ msg: "This donation is not available for claiming" })
    }

    donation.status = "claimed"
    donation.claimedBy = req.user.id

    await donation.save()
    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/donations/:id/complete
// @desc    Mark a donation as completed (NGO only)
// @access  Private
router.put("/:id/complete", auth, async (req, res) => {
  try {
    // Check if user is an NGO
    if (req.user.userType !== "ngo") {
      return res.status(403).json({ msg: "Only NGOs can complete donations" })
    }

    const donation = await Donation.findById(req.params.id)

    if (!donation) {
      return res.status(404).json({ msg: "Donation not found" })
    }

    if (donation.status !== "claimed") {
      return res.status(400).json({ msg: "Only claimed donations can be marked as completed" })
    }

    // Check if this NGO claimed the donation
    if (donation.claimedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" })
    }

    donation.status = "completed"
    await donation.save()

    res.json(donation)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
