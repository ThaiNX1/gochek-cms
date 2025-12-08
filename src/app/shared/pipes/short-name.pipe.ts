import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'shortName'
})
export class ShortNamePipe implements PipeTransform {

  transform(fullName: string): string {
    let shotName = ''
    if (fullName) {
      const names = fullName?.trim()?.split(' ')?.reduce((arr: any, curr) => {
        arr.push(curr?.trim())
        return arr
      }, []) || []
      shotName = names?.length === 1
        ? names?.[0]?.substring(0, 1)
        : names?.[0]?.substring(0, 1) + names?.[names.length - 1]?.substring(0, 1)
    }
    return shotName.toUpperCase()
  }
}
