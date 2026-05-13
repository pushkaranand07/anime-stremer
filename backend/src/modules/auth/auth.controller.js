const authService = require('./auth.service');
const asyncHandler = require('../../utils/asyncHandler');
const ApiResponse = require('../../utils/ApiResponse');

const signup = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  res.status(201).json(new ApiResponse(201, 'User registered successfully', result));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, 'Login successful', result));
});

const refreshToken = asyncHandler(async (req, res) => {
  // To be implemented: Refresh token logic
  res.status(501).json(new ApiResponse(501, 'Not implemented yet'));
});

module.exports = {
  signup,
  login,
  refreshToken,
};
