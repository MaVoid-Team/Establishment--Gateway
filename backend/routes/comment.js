const express = require("express");
const commentController = require("../controllers/commentController");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/:ticket_id/comments", 
    authController.authorize([2,3,4,5, 6, 7]),
    commentController.addComment
);

router.get("/:ticket_id/comments", 
    authController.authorize([2,3,4,5, 6, 7]),
    commentController.getCommentsByTicket
);

router.put("/:id", 
    authController.authorize([2,3,4,5, 6, 7]),
    commentController.updateComment    
);

router.delete("/:id", 
    authController.authorize([2,3,4,5, 6, 7]),
    commentController.deleteComment
);

module.exports = router;