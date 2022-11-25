import Excel from "exceljs"
import path from "path"

export async function writeToFile(result: any) {
    const workbook = new Excel.Workbook();
    const filePath = path.resolve(__dirname, "..", "..")

    await workbook.xlsx.readFile(
        path.join(filePath, "report.template.xlsx")
    );

    const sheet = workbook.getWorksheet("Sheet1")

    sheet.getCell(2, 3).value = result.metadata.generatedTime
    sheet.getCell(3, 3).value = result.metadata.from
    sheet.getCell(4, 3).value = result.metadata.to

    let row = 8;
    let count = 1;

    for (const item of result.data) {
        sheet.getCell(row, 2).value = count ++
        sheet.getCell(row, 3).value = item.names
        sheet.getCell(row, 4).value = item.currentScore

        let changeData = "0";
        if (item.changed > 0) {
            changeData = `+${item.changed}`
        }
        if (item.changed < 0) {
            changeData = `${item.changed}`
        }
        sheet.getCell(row, 5).value = changeData
        row++;
    }
    await workbook.xlsx.writeFile(
        path.join(filePath, "report.xlsx"));
}
