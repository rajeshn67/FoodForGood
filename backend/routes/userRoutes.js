const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const auth = require("../middleware/auth")

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  const { fullName, email, password, userType, phone, address } = req.body

  try {
    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ msg: "User already exists" })
    }

    // Create new user
    user = new User({
      fullName,
      email,
      password,
      userType,
      phone,
      address,
    })

    await user.save()

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    }

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, userType: user.userType, fullName: user.fullName });
      }
    );
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   POST api/users/login
// @desc    Login user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body

  try {
    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" })
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id,
        userType: user.userType,
      },
    }

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) throw err;
        res.json({ token, userType: user.userType, fullName: user.fullName });
      }
    );
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/users/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", auth, async (req, res) => {
  const { fullName, phone, address } = req.body

  try {
    // Find user
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    // Update fields (email and userType cannot be changed)
    if (fullName) user.fullName = fullName
    if (phone) user.phone = phone
    if (address) user.address = address

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(req.user.id).select("-password")
    res.json(updatedUser)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

// @route   GET api/users/ngos
// @desc    Get all NGOs
// @access  Private
router.get("/ngos", auth, async (req, res) => {
  try {
    const ngos = await User.find({ userType: "ngo" }).select("-password")
    res.json(ngos)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server error")
  }
})

module.exports = router
