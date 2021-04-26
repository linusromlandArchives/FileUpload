module.exports = (function () {
	//Dependencies import
	const express = require("express");
	const router = express.Router();
	const filesize = require("filesize");
	const File = require("../models/File.js");
	const login = require("../login.js");
	const upload = require("../upload.js");
	const database = require("../database.js");
	const fileSizeLimitMB =
		process.env.FILESIZELIMITMB * 1024 * 1024 || 52428800;

	router.get("/upload", login.checkAuthenticated, (req, res) => {
		res.render("pages/upload", {
			maxFileSize: fileSizeLimitMB,
		});
	});

	router.post("/uploadFile", login.checkAuthenticated, async (req, res) => {
		try {
			let fileFromUser = await req.files.file;
			let user = await req.user;

			let fileModel = upload.createFile(
				fileFromUser.name,
				user.name,
				req.body.title,
				req.body.desc,
				req.body.maxDownloads,
				fileFromUser.size
			);
			await req.files.file.mv("./uploaded/" + fileModel._id);
			database.saveToDB(fileModel);
			console.log(
				`[NEW UPLOAD]\nThe user "${
					user.name
				}" uploaded a new file! \nFilename: "${
					fileFromUser.name
				}" Filesize: ${filesize(fileFromUser.size)}`
			);
			let id = fileModel._id + "" //this is ulgy but otherwise the fkn mongoid adds ""
			res.status(201).send(id);
		} catch (error) {
			console.log(error);
			res.sendStatus(500);
		}
	});

	return router;
})();
