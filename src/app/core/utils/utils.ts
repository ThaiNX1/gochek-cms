import { constant } from "../constants/constant"

// @ts-ignore
export function randomColor(exceptColor?: string) {
  let color = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  if (exceptColor && color?.toUpperCase() === exceptColor?.toUpperCase())
    randomColor(exceptColor)
  else
    return color
}

export function getListHour12() {
  let result = []
  for (let i = 0; i < 24; i++) {
    if (i < 12)
      result.push({
        value: i,
        label: i < 10 ? `0${i}` : i + 'AM'
      })
    else
      result.push({
        value: i,
        label: i + 'PM'
      })
  }
  return result
}

export function getListHour24() {
  let result = []
  for (let i = 0; i < 24; i++) {
    result.push({
      value: i,
      label: i < 10 ? `0${i}` : i.toString()
    })
  }
  return result
}

export function getListMinute() {
  let result = []
  for (let i = 0; i < 60; i++) {
    result.push({
      value: i,
      label: i < 10 ? `0${i}` : i.toString()
    })
  }
  return result
}

export function getListDayOfWeek() {
  let result = []
  for (let i = 0; i < 7; i++) {
    result.push({
      value: i,
      label: i === 0 ? 'CN' : `T${i + 1}`
    })
  }
  return result
}

export function getListDayOfMonth() {
  let result = []
  for (let i = 1; i < 32; i++) {
    result.push({
      value: i,
      label: `Ngày ${i}`
    })
  }
  return result
}

export function getHours() {
  const _hours = []
  for (let i = 0; i < 24; i++) {
    if (i < 10)
      _hours.push({
        value: i,
        label: `0${i}`
      })
    else
      _hours.push({
        value: i,
        label: `${i}`
      })
  }
  return _hours
}

export function getMinutes() {
  const _minutes = []
  for (let i = 0; i < 60; i++) {
    if (i < 10)
      _minutes.push({
        value: i,
        label: `0${i}`
      })
    else
      _minutes.push({
        value: i,
        label: `${i}`
      })
  }
  return _minutes
}

export function urlModify(text: string) {
  if (!text?.length)
    return text
  const urlRegex = /((http|https)?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank" class="text-blue-300 no-underline break-all word-wrap">' + url + '</a>';
  })
}

export function urlVerify(text: string) {
  if (!text?.length)
    return false
  const urlRegex = /((http|https)?:\/\/[^\s]+)/g;
  return !!text.match(urlRegex)?.length
}

export function string2date(date: string, format: string = 'dd/MM/yyyy'): Date | null {
  let result = null
  let dateSplit = null
  switch (format) {
    case 'dd/MM/yyyy':
      dateSplit = date.split('/')
      result = new Date(Number(dateSplit[2]), Number(dateSplit[1]) - 1, Number(dateSplit[0]))
      break
    case 'yyy/MM/dd':
      result = new Date(date)
      break
  }
  return result
}

export function encodeToBase64(input: string): string {
  try {
    return btoa(input);
  } catch (error) {
    throw new Error('Invalid input for Base64 encoding. Ensure input is a valid string.');
  }
}

const colorMap: any = {
  'a': '#FF5733', 'b': '#33FF57', 'c': '#3357FF', 'd': '#FF33A1', 'e': '#FFC300',
  'f': '#DAF7A6', 'g': '#581845', 'h': '#900C3F', 'i': '#C70039', 'j': '#1F618D',
  'k': '#6A1B9A', 'l': '#4CAF50', 'm': '#F57F17', 'n': '#FF6F61', 'o': '#2196F3',
  'p': '#00BCD4', 'q': '#3F51B5', 'r': '#CDDC39', 's': '#FF9800', 't': '#FFEB3B',
  'u': '#8BC34A', 'v': '#9C27B0', 'w': '#FF5722', 'x': '#607D8B', 'y': '#795548',
  'z': '#009688',
  '0': 'rgb(82 80 80)', '1': '#424242', '2': '#757575', '3': '#BDBDBD', '4': '#E0E0E0',
  '5': '#FFC107', '6': '#FFEB3B', '7': '#CDDC39', '8': '#8BC34A', '9': '#4CAF50'
};

// Hàm lấy màu từ bảng ánh xạ
export function getColorForChar(ch: string) {
  return colorMap[ch?.toLowerCase()] || '#607D8B'; // Màu mặc định nếu không tìm thấy
}


export function generateTimeArray(stepMinutes: number): { value: number, label: string }[] {
  const times: { value: number, label: string }[] = [];
  const totalMinutes = 24 * 60;

  for (let minutes = 0; minutes < totalMinutes; minutes += stepMinutes) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    // Pad với '0' nếu cần
    const time = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    times.push({ value: minutes, label: time });
  }

  return times;
}

export function generateTimeArray12h(stepMinutes: number): { value: number, label: string }[] {
  const times: { value: number, label: string }[] = [];
  const totalMinutes = 24 * 60;

  for (let minutes = stepMinutes; minutes < totalMinutes; minutes += stepMinutes) {
    const hrs24 = Math.floor(minutes / 60);
    const mins = minutes % 60;

    // Convert to 12-hour format
    const period = hrs24 >= 12 ? 'PM' : 'AM';
    const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;

    const time = `${hrs12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
    times.push({ value: minutes, label: time });
  }

  return times;
}

export function stringToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function numberToTime(milliseconds: number) {
  const hrs24 = Math.floor(milliseconds / (60 * 60 * 1000));
  const mins = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

  const time = `${hrs24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  return time;
}

export function minutesToString(minutes: number) {
  const hrs24 = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const time = `${hrs24.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  return time;
}



export function getDayOffs(dayOff: number[]): string[] {
  return constant.dayOfWeekList.reduce((acc: string[], item: any) => {
    if (dayOff.includes(item.code)) {
      acc.push(item.name);
    }
    return acc;
  }, []);
}