// Trouve la carte Shopify blanche dans un visuel « Résultats clients », la recadre et lit les montants.
// Usage : swift dash.swift entree.png sortie.png  → imprime  x y w h | texte OCR
import Foundation
import AppKit
import Vision

let a = CommandLine.arguments
guard let img = NSImage(contentsOfFile: a[1]), let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }
let W = cg.width, H = cg.height
let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: W * 4, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.draw(cg, in: CGRect(x: 0, y: 0, width: W, height: H))
let px = ctx.data!.bindMemory(to: UInt8.self, capacity: W * H * 4)
func light(_ x: Int, _ y: Int) -> Bool { let i = (y * W + x) * 4; return px[i] > 225 && px[i+1] > 225 && px[i+2] > 225 }
var rows = [Int](repeating: 0, count: H), cols = [Int](repeating: 0, count: W)
for y in stride(from: 0, to: H, by: 2) { for x in stride(from: 0, to: W, by: 2) where light(x, y) { rows[y] += 1; cols[x] += 1 } }
// Lignes très majoritairement blanches = la carte ; on garde la plus longue suite continue
let rowT = W / 2 * 28 / 100
var best = (0, 0), cur = (-1, 0)
for y in stride(from: 0, to: H, by: 2) {
  if rows[y] > rowT { if cur.0 < 0 { cur = (y, y) } else { cur.1 = y } ; if cur.1 - cur.0 > best.1 - best.0 { best = cur } }
  else if cur.0 >= 0 && y - cur.1 > 70 { cur = (-1, 0) }
}
let y0 = best.0, y1 = best.1
guard y1 - y0 > 200 else { print("none"); exit(0) }
var cols2 = [Int](repeating: 0, count: W)
for y in stride(from: y0, to: y1, by: 2) { for x in stride(from: 0, to: W, by: 2) where light(x, y) { cols2[x] += 1 } }
let xs = cols2.indices.filter { cols2[$0] > (y1 - y0) / 2 * 45 / 100 }
guard let x0 = xs.first, let x1 = xs.last else { print("none"); exit(0) }
let rect = CGRect(x: x0, y: y0, width: x1 - x0, height: y1 - y0)
let crop = cg.cropping(to: rect)!
let rep = NSBitmapImageRep(cgImage: crop)
try rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[2]))
let req = VNRecognizeTextRequest(); req.recognitionLanguages = ["fr-FR"]; req.recognitionLevel = .accurate
try VNImageRequestHandler(cgImage: crop).perform([req])
let txt = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: " ¦ ")
print("\(x0) \(y0) \(x1 - x0) \(y1 - y0) | \(txt)")
