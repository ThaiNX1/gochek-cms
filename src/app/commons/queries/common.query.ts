import { gql } from "apollo-angular";

export const UPLOAD_FILE = gql`
mutation UploadFile($file: Upload!, $folder: String!) {
    uploadFile(file: $file, folder: $folder){
        filename
        folder
        url
        basePath
        md5
    }
}
`;