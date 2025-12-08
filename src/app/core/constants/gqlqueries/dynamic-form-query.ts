import { gql } from "apollo-angular";

export const GET_FORM_BY_MENU = gql`
  query GetFormsByMenu($menuId: uuid!, $formType: String!) {
    core_core_dynamic_menu_forms(
      where: {
        menu_id: { _eq: $menuId }
        form_type: { _eq: $formType }
        deleted_at: { _is_null: true }
        core_dynamic_form: {
          deleted_at: { _is_null: true }
          core_dynamic_form_fields: {
            core_dynamic_field: { deleted_at: { _is_null: true } }
          }
        }
      }
    ) {
      id
      form_type
      form_id
      menu_id
      core_dynamic_form {
        id
        name
        code
        core_dynamic_form_fields {
          id
          is_required
          position
          option_id
          core_dynamic_field {
            id
            code
            field_type
            configuration
            description
            name
            status
            option_values
          }
        }
      }
    }
  }
`;

export const GET_RECORD_BY_MENU = gql`
  query getMenuRecordList($menuId: String!, $page: Float, $size: Float, $keyword: String) {
    mes {
      factoryMenuRecordList(
        menuId: $menuId
        filter: { page: $page, size: $size, keyword: $keyword }
      ) {
        total
        count
        data {
          id
          code
          title
          menuId
          menu
          statusId
          status
          data
        }
      }
    }
  }
`;

export const GET_WORKFLOW_TRANSITION = gql`
  query GetAllTransitionsForWorkflow($workflowId: uuid!, $statusId: uuid) {
    core_core_dynamic_workflow_transitions(
      where: {
        from_status_id: { _eq: $statusId }
        workflow_id: { _eq: $workflowId }
        deleted_at: { _is_null: true }
      }
    ) {
      id
      name
      form_id
      from_status_id
      to_status_id
    }
  }
`;

export const GET_WORKFLOW_TRANSITION_FIRST = gql`
  query GetAllTransitionsForWorkflow($workflowId: uuid!) {
    core_core_dynamic_workflow_transitions(
      where: {
        from_status_id: { _is_null: true }
        workflow_id: { _eq: $workflowId }
        deleted_at: { _is_null: true }
      }
    ) {
      id
      name
      form_id
      from_status_id
      to_status_id
    }
  }
`;

export const GET_WORKFLOW_TRANSITION_DETAIL = gql`
  query GetWorkflowTransitionDetail($transitionId: uuid!) {
    core_core_dynamic_workflow_transitions_by_pk(id: $transitionId) {
      id
      name
      organization_id
      workflow_id
      core_dynamic_form {
        id
        name
        status
        code
        core_dynamic_form_fields {
          id
          is_required
          position
          option_id
          core_dynamic_field {
            id
            code
            field_type
            configuration
            description
            name
            status
            option_values
          }
          source_data
        }
      }
    }
  }
`;

export const CREATE_RECORD = gql`
  mutation InsertMenuRecord(
    $menuId: String!
    $title: String!
    $submissionData: JSON
    $poId: String
    $poComponents: JSON
  ) {
    mes {
      factoryInsertMenuRecord(
        args: {
          menuId: $menuId
          title: $title
          submissionData: $submissionData
          poId: $poId
          poComponents: $poComponents
        }
      ) {
        id
        code
        menuId
        organizationId
        workflowId
        data
      }
    }
  }
`;

export const PRODUCTION_ORDER_LIST = gql`
  query factoryProductionGetOrderList($filter: ListPOFilter) {
    mes {
      factoryProductionGetOrderList(filter: $filter) {
        total
        count
        productionOrders {
          id
          poCode
        }
      }
    }
  }
`;

export const PO_COMPONENT_GET_LIST = gql`
  query factoryProductionOrderGetComponentList($filter: POComponentFilter, $poId: String!) {
    mes {
      factoryProductionOrderGetComponentList(filter: $filter, poId: $poId) {
        total
        count
        components {
          id
          productType {
            code
            name
          }
        }
      }
    }
  }
`;

export const SUBMISSION_FORM_DATA = gql`
  mutation submissionFormData(
    $recordId: String!
    $name: String!
    $submissionData: JSON!
    $transitionId: String!
  ) {
    mes {
      factoryInsertSubmissionForm(
        args: {
          recordId: $recordId
          name: $name
          submissionData: $submissionData
          transitionId: $transitionId
        }
      ) {
        id
        code
        submissionData
      }
    }
  }
`;

export const MENU_GET_RECORD = gql`
  query getMenuRecord($recordId: String!) {
    mes {
      factoryMenuGetRecord(recordId: $recordId) {
        id
        code
        title
        data
        createdAt
        statusId
        status
        productionOrder{
          id
          poCode
        }
      }
    }
  }
`;

export const GET_ALL_OPTIONS = gql`
  query getAllOptions($optionId: uuid!) {
    core_core_option_items(
      where: { 
        deleted_at: { _is_null: true }, 
        option_id: { _eq: $optionId } 
      }
      order_by: { created_at: desc }
    ) {
      id
      code
      name
      parent_id
    }
  }
`;