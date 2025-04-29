import fs from fs;

export const deleteLocalFile = (filePath) => {
    fs.unlink(filePath, (error) => {
        if (error) {
            console.error(`Failed to delete local file: ${filePath}`, err);
        } else {
            console.log(`Deleted local file: ${filePath}`);
        }
    });
};