// Détoure une personne (Vision) et la pose sur le fond violet MADE #B691FE.
// Usage : swift tools/fond-violet.swift entree.jpg sortie.jpg [--nb]  (--nb = sujet en noir et blanc)
import Foundation
import Vision
import CoreImage
import AppKit

let args = CommandLine.arguments
guard args.count >= 3, let input = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else {
  print("usage: swift fond-violet.swift entree.jpg sortie.jpg"); exit(1)
}
let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: input)
try handler.perform([request])
guard let result = request.results?.first else { print("aucun sujet détecté"); exit(1) }
let maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: maskBuffer)
let sujet = args.contains("--nb") ? input.applyingFilter("CIPhotoEffectNoir") : input
let violet = CIImage(color: CIColor(red: 182/255, green: 145/255, blue: 254/255)).cropped(to: input.extent)
let out = sujet.applyingFilter("CIBlendWithMask", parameters: [kCIInputBackgroundImageKey: violet, kCIInputMaskImageKey: mask])
let ctx = CIContext()
guard let cg = ctx.createCGImage(out, from: input.extent) else { exit(1) }
let rep = NSBitmapImageRep(cgImage: cg)
try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.85])!.write(to: URL(fileURLWithPath: args[2]))
print("ok")
