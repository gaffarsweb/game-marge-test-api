import * as path from "path";
import * as fs from "fs";
import * as fastCSV from "fast-csv";
import { Response } from "express";
import { promisify } from "util";

const unlinkAsync = promisify(fs.unlink);

/**
 * Generic CSV generator and downloader for Express.
 */
const generateCSV = async (
    records: any[] = [],
    headers: { [key: string]: string | Function },
    fileName: string = "",
    res: Response | null = null
): Promise<any> => {
    if (!records || records.length === 0) {
        return res?.status(204).json({
            status: false,
            message: "No records to export",
        });
    }

    try {
        const csvHeaders = Object.keys(headers);
        const accessors = Object.values(headers);

        const plainRecords = records.map((record) => {
            const row: { [key: string]: any } = {};
            accessors.forEach((accessor, index) => {
                if (typeof accessor === "function") {
                    row[csvHeaders[index]] = accessor(record);
                } else {
                    row[csvHeaders[index]] = resolvePath(record, accessor);
                }
            });
            return row;
        });

        const filePath = path.join(__dirname, fileName);
        const ws = fs.createWriteStream(filePath);

        return new Promise<any>((resolve, reject) => {
            fastCSV
                .write(plainRecords, { headers: true })
                .pipe(ws)
                .on("finish", () => {
                    res?.download(filePath, fileName, async (err) => {
                        if (err) {
                            console.error("Download error:", err);
                            return res?.status(500).json({ status: false, message: "Download failed" });
                        }

                        try {
                            await unlinkAsync(filePath);
                        } catch (unlinkErr) {
                            console.error("File deletion error:", unlinkErr);
                        }

                        resolve({
                            status: true,
                            code: 200,
                            data: {
                                fileName,
                                filePath,
                            },
                        });
                    });
                })
                .on("error", (err) => {
                    console.error("CSV writing error:", err);
                    reject(err);
                });
        });

    } catch (error) {
        console.error("CSV generation error:", error);
        return {
            status: false,
            code: 500,
            msg: error,
        };
    }
};

const resolvePath = (obj: any, pathStr: string): any => {
    return pathStr.split('.').reduce((acc, part) => acc?.[part], obj) ?? "";
};

export default generateCSV;
