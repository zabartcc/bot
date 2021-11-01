"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zabApi = exports.config = void 0;
const axios_1 = __importDefault(require("axios"));
exports.config = {
    atcPos: ['PHX', 'ABQ', 'TUS', 'AMA', 'ROW', 'ELP', 'SDL', 'CHD', 'FFZ', 'IWA', 'DVT', 'GEU', 'GYR', 'LUF', 'RYN', 'DMA', 'FLG', 'PRC', 'AEG', 'BIF', 'HMN', 'SAF', 'FHU'],
    airports: ['KPHX', 'KABQ', 'KTUS', 'KAMA', 'KROW', 'KELP', 'KSDL', 'KCHD', 'KFFZ', 'KIWA', 'KDVT', 'KGEU', 'KGYR', 'KLUF', 'KRYN', 'KDMA', 'KFLG', 'KPRC', 'KAEG', 'KBIF', 'KHMN', 'KSAF', 'KFHU'],
    ratings: ['Unknown', 'OBS', 'S1', 'S2', 'S3', 'C1', 'C2', 'C3', 'I1', 'I2', 'I3', 'SUP', 'ADM'],
    ratingsLong: ['Unknown', 'Observer', 'Student', 'Student 2', 'Senior Student', 'Controller', 'Controller 2', 'Senior Controller', 'Instructor', 'Instructor 2', 'Senior Instructor', 'Supervisor', 'Administrator'],
};
exports.zabApi = axios_1.default.create({
    baseURL: process.env.ZAB_API_URL,
    headers: {
        Authorization: `Bearer ${process.env.ZAB_API_KEY}`,
    },
});
