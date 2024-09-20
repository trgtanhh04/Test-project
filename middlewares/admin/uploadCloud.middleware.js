
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.CLOUD_KEY, 
    api_secret: process.env.CLOUD_SECRET // Click 'View API Keys' above to copy your API secret
});

module.exports.upload = async (req, res, next)=>{
    if (req.file) {
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                  (error, result) => {
                    if (result) {
                      resolve(result);
                    } else {
                      reject(error);
                    }
                  }
                );
              streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        try {
            let result = await streamUpload(req);
            req.body[req.file.fieldname] = result.url;
            next();  // Chuyển sang middleware tiếp theo
        } catch (error) {
            console.error('Lỗi upload:', error);
            res.status(500).send({ error: 'Upload failed.' }); // Trả về lỗi nếu upload thất bại
        }
    } else {
        next();  // Nếu không có file, chuyển sang middleware tiếp theo
    }
}