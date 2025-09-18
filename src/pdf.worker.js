// src/pdf.worker.js
// import the legacy UMD worker from pdfjs-dist
import { version as pdfjsVersion } from "pdfjs-dist/package.json";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf";

self.pdfjsVersion = pdfjsVersion;
self.pdfjsLib = pdfjsLib;
