const User = require("../models/User");
const mongoose = require("mongoose");
//get all users
const getAllUsers = async (req, res)=>{
    try{
        const users = await User.find({
            _id:{ $ne: req.userId }
        })
        .select("-password")
        .sort({name: 1});

        res.status(200).json({
            message:"Users fetched successfully",
            count:users.length,
            users
        });
    }catch(error){
        console.log("Get users error:", error.message);
        res.status(500).jsno({
            message:"Server error"
        });
    }
};
const searchUsers = async (req, res)=>{
    try{
        const keyword = req.query.keyword;
        if(!keyword || !keyword.trim()){
            return res.status(400).json({
                message:"Please provide a search keyword"
            });
        }
        const users = await User.find({
            _id:{ $ne:req.userId},
            $or:[ 
                { name :{$regex:keyword, $options:"i"}},
                { email: {$regex:keyword, $options:"i"}}
            ]
        })
        .select("-password");

        res.status(200).json({
            message:"Users found successfully",
            count:users.length,
            users
        });
    }catch(error){
        console.error("Search users error:", error.message);
        res.status(500).json({
            message:"Server error"
        });
    }
};
//update logged in user profile
const updateProfile = async (req, res)=>{
    try{
        const {name, profilePicture} = req.body;
        if(name==undefined && profilePicture==undefined){
            return res.status(400).json({
                message:"Please provide information to update"
            });
        } 
        //prepate fields to update
        const updateData = {};
        if(name!==undefined){
            if(!name.trim()){
                return res.status(400).json({
                    message:"Name cannot be empty"
                });
            }
            updateData.name = name.trim();
        }
        if(profilePicture!==undefined){
            updateData.profilePicture = profilePicture;
        }
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            {$set:updateData},
            {
                new:true,
                runValidators:true
            }
        ).select("-password");
        if(!updatedUser){
            return res.status(404).json({
                message:"User not found"
            });
        }
        res.status(200).json({
            message:"Profile updated successfully",
            user:updatedUser
        });
    }catch(error){
        console.error("Update profile error:", error.message);
        res.status(500).json({
            message:"Server error"
        });
    }
};
const getUserById = async (req, res)=>{
    try{
        const {userId} = req.params;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.statut(400).json({
                message:"Invelid user ID"
            });
        }
        const user = await User.findById(userId).select("-password");
        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }
        res.status(200).json({
            message:"User fetched successfully",
            user
        });
    }catch(error){
        console.error("Get user error:", error.message);
        res.status(500).json({
            message:"Server error"
        })
    }
};
module.exports = { getAllUsers, searchUsers, updateProfile, getUserById };