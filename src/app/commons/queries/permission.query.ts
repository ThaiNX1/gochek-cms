import { gql } from "apollo-angular";

// Get all permissions
export const GET_PERMISSIONS = gql`
  query Permissions {
    permissions {
      id
      name
      code
      action
      type
      description
      isActive
      createdAt
      updatedAt
      deletedAt
      roles {
        id
        name
        code
      }
    }
  }
`;

// Get permissions by type
export const GET_PERMISSIONS_BY_TYPE = gql`
  query PermissionsByType($type: PermissionTypeEnum!) {
    permissionsByType(type: $type) {
      id
      name
      code
      action
      type
      description
      isActive
      createdAt
      updatedAt
      deletedAt
      roles {
        id
        name
        code
      }
    }
  }
`;

// Import permission
export const IMPORT_PERMISSION = gql`
  mutation ImportPermissions($file: Upload!) {
    importPermissions(file: $file) {
        action
        code
        type
    }
  }
`;
