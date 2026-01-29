import { gql } from "apollo-angular";

export const UPLOAD_FILE = gql`
mutation UploadFile($file: Upload!, $folder: String!, $md5: String) {
    uploadFile(file: $file, folder: $folder, md5: $md5){
        filename
        folder
        url
        basePath
        md5
    }
}
`;