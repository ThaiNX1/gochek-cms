import { RoleCode } from "../../commons/types";
import { DayOfWeekEnum } from "./enum";

export const constant = {
  roleCodes: [
    { name: 'Quản trị tổ chức', code: RoleCode.ORGANIZATION_ADMIN },
    { name: 'Người dùng', code: RoleCode.END_USER },
    { name: 'Quản trị viên', code: RoleCode.ADMINISTRATOR },
  ],
  statusList: [
    { name: 'Hoạt động', code: true },
    { name: 'Không hoạt động', code: false },
  ],
  deviceStatusList: [
    { name: 'Kích hoạt', code: true },
    { name: 'Chưa kích hoạt', code: false },
  ],
  dayOfWeekList: [
    { name: 'Thứ 2', shortName: 'T2', code: DayOfWeekEnum.MONDAY },
    { name: 'Thứ 3', shortName: 'T3', code: DayOfWeekEnum.TUESDAY },
    { name: 'Thứ 4', shortName: 'T4', code: DayOfWeekEnum.WEDNESDAY },
    { name: 'Thứ 5', shortName: 'T5', code: DayOfWeekEnum.THURSDAY },
    { name: 'Thứ 6', shortName: 'T6', code: DayOfWeekEnum.FRIDAY },
    { name: 'Thứ 7', shortName: 'T7', code: DayOfWeekEnum.SATURDAY },
    { name: 'Chủ nhật', shortName: 'CN', code: DayOfWeekEnum.SUNDAY },
  ],
  fileFolder: {
    firmwares: 'firmwares',
    audios: 'audios',
  }
};
