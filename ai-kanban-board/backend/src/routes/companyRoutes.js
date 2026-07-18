const express = require("express");
const {
    listCompanies,
    createCompany,
    getCompany,
    updateCompany,
    deleteCompany,
    listMembers,
    addMember,
    removeMember,
    generateInvite,
    listInvites,
    deleteInvite,
    getInvite: getCompanyInvite,
    acceptInvite: acceptCompanyInvite,
} = require("../controllers/companyController");
const { requireAuth } = require("../middleware/auth");
const requireCompanyAccess = require("../middleware/companyAccess");

const router = express.Router();

// Public route for fetching invite info
router.get("/company-invite/:token", getCompanyInvite);

router.use(requireAuth);

// CRUD
router.get("/companies", listCompanies);
router.post("/companies", createCompany);

router.get("/companies/:companyId", requireCompanyAccess, getCompany);
router.put("/companies/:companyId", requireCompanyAccess, updateCompany);
router.delete("/companies/:companyId", requireCompanyAccess, deleteCompany);

// Members
router.get("/companies/:companyId/members", requireCompanyAccess, listMembers);
router.post("/companies/:companyId/members", requireCompanyAccess, addMember);
router.delete("/companies/:companyId/members/:userId", requireCompanyAccess, removeMember);

// Invites
router.post("/companies/:companyId/invites", requireCompanyAccess, generateInvite);
router.get("/companies/:companyId/invites", requireCompanyAccess, listInvites);
router.delete("/companies/:companyId/invites/:inviteId", requireCompanyAccess, deleteInvite);

// Accept invite (auth required)
router.post("/company-invite/:token/accept", acceptCompanyInvite);

module.exports = router;
