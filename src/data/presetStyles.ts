import { GarmentStyle } from '../types';

export const PRESET_STYLES: GarmentStyle[] = [
  {
    id: 'style-polo-01',
    name: 'Basic Polo Shirt',
    styleCode: 'PL-892',
    lineNo: 'Line 04',
    buyer: 'H&M / Next',
    targetHourly: 180,
    workingHours: 8,
    targetEfficiency: 85,
    hourlyOutputs: [165, 175, 180, 182, 174, 178, 182, 172],
    downtimeLogs: [
      { id: 'dt-1', hour: 1, minutesLost: 8, reason: 'Thread Breakage', note: 'Collar attachment thread tension issue' },
      { id: 'dt-2', hour: 5, minutesLost: 12, reason: 'Machine Breakdown', note: 'Overlock 4D looper sync adjustment' }
    ],
    operations: [
      { id: 'p-1', seq: 1, name: 'Collar Band Stitch', machine: 'SNLS', section: 'Collar & Cuff', smv: 0.65, ops: 1, remarks: 'Fold and run 1/4" stitch' },
      { id: 'p-2', seq: 2, name: 'Front Placket Join & Creasing', machine: 'SNLS', section: 'Front', smv: 1.10, ops: 2, remarks: 'Center box placket' },
      { id: 'p-3', seq: 3, name: 'Attach Collar to Neck', machine: 'SNLS', section: 'Assembly', smv: 0.95, ops: 2, remarks: 'Match notch points' },
      { id: 'p-4', seq: 4, name: 'Shoulder Join with Clear Elastic', machine: 'OL-4D', section: 'Assembly', smv: 0.45, ops: 1, remarks: 'Reinforced mobilon tape' },
      { id: 'p-5', seq: 5, name: 'Sleeve Hemming with Rib/Folder', machine: 'FL', section: 'Component', smv: 0.50, ops: 1, remarks: 'Flatlock bottom edge' },
      { id: 'p-6', seq: 6, name: 'Attach Sleeve to Armhole', machine: 'OL-4D', section: 'Assembly', smv: 1.25, ops: 2, remarks: 'Feed differential 1.2' },
      { id: 'p-7', seq: 7, name: 'Side Seam with Slit Prep', machine: 'OL-4D', section: 'Assembly', smv: 0.85, ops: 2, remarks: 'Herringbone tape insert' },
      { id: 'p-8', seq: 8, name: 'Bottom Hemming', machine: 'FL', section: 'Assembly', smv: 0.60, ops: 1, remarks: 'Coverstitch 2-needle' },
      { id: 'p-9', seq: 9, name: 'Button Hole & Button Attach', machine: 'BUTTON_HOLE', section: 'Finishing', smv: 0.45, ops: 1, remarks: '2 buttons on placket' },
      { id: 'p-10', seq: 10, name: 'Thread Trimming & Inspection', machine: 'MANUAL', section: 'Finishing', smv: 0.40, ops: 1, remarks: '100% inline check' },
      { id: 'p-11', seq: 11, name: 'Final Garment Pressing', machine: 'IRON', section: 'Finishing', smv: 0.55, ops: 1, remarks: 'Steam dummy press' }
    ]
  },
  {
    id: 'style-tshirt-02',
    name: 'Basic Crew Neck T-Shirt',
    styleCode: 'TS-104',
    lineNo: 'Line 02',
    buyer: 'Zara / Inditex',
    targetHourly: 220,
    workingHours: 8,
    targetEfficiency: 90,
    hourlyOutputs: [210, 222, 225, 218, 220, 224, 219, 215],
    downtimeLogs: [
      { id: 'dt-3', hour: 4, minutesLost: 5, reason: 'Needle Break', note: 'Flatlock left needle replace' }
    ],
    operations: [
      { id: 't-1', seq: 1, name: 'Rib Neck Prep & Ring Make', machine: 'SNLS', section: 'Component', smv: 0.35, ops: 1, remarks: 'Rib stretch gauge check' },
      { id: 't-2', seq: 2, name: 'Shoulder Join with Tape', machine: 'OL-4D', section: 'Assembly', smv: 0.40, ops: 1, remarks: '100% mobilon tape' },
      { id: 't-3', seq: 3, name: 'Attach Neck Rib to Body', machine: 'OL-4D', section: 'Assembly', smv: 0.70, ops: 2, remarks: 'Uniform tension' },
      { id: 't-4', seq: 4, name: 'Back Neck Tape Topstitch', machine: 'SNLS', section: 'Assembly', smv: 0.45, ops: 1, remarks: 'Conceal raw rib seam' },
      { id: 't-5', seq: 5, name: 'Attach Sleeve to Armhole', machine: 'OL-4D', section: 'Assembly', smv: 0.90, ops: 2, remarks: 'Open seam method' },
      { id: 't-6', seq: 6, name: 'Side Seam & Sleeve Close', machine: 'OL-4D', section: 'Assembly', smv: 0.75, ops: 2, remarks: 'Match armpit cross point' },
      { id: 't-7', seq: 7, name: 'Bottom & Sleeve Hemming', machine: 'FL', section: 'Assembly', smv: 0.80, ops: 2, remarks: 'Bottom hem 3/4"' },
      { id: 't-8', seq: 8, name: 'Thread Trimming & QC', machine: 'MANUAL', section: 'Packaging', smv: 0.35, ops: 1, remarks: 'Trim & polybag pack' }
    ]
  },
  {
    id: 'style-jeans-03',
    name: 'Denim 5-Pocket Regular Jeans',
    styleCode: 'DN-501',
    lineNo: 'Line 07',
    buyer: "Levi's / VF Corp",
    targetHourly: 120,
    workingHours: 8,
    targetEfficiency: 82,
    hourlyOutputs: [105, 115, 118, 122, 119, 120, 121, 118],
    downtimeLogs: [
      { id: 'dt-4', hour: 2, minutesLost: 15, reason: 'Machine Breakdown', note: 'Feed-off-the-arm needle sync adjustment' }
    ],
    operations: [
      { id: 'j-1', seq: 1, name: 'Coin Pocket Attach to Facing', machine: 'SNLS', section: 'Front', smv: 0.55, ops: 1, remarks: 'Double row topstitch' },
      { id: 'j-2', seq: 2, name: 'Front Pocket Bag Join & Turn', machine: 'SNLS', section: 'Front', smv: 0.70, ops: 1, remarks: 'French seam construction' },
      { id: 'j-3', seq: 3, name: 'Front Pocket Scoop Topstitch', machine: 'DNLS', section: 'Front', smv: 0.85, ops: 2, remarks: 'Gauge 1/4 inch' },
      { id: 'j-4', seq: 4, name: 'Fly Zipper Attach to Left Front', machine: 'SNLS', section: 'Front', smv: 0.90, ops: 2, remarks: 'YKK metal zipper #5' },
      { id: 'j-5', seq: 5, name: 'J-Stitch on Front Fly', machine: 'SNLS', section: 'Front', smv: 0.75, ops: 2, remarks: 'Using J-stitch template' },
      { id: 'j-6', seq: 6, name: 'Back Pocket Hem & Decorative Arc', machine: 'DNLS', section: 'Back', smv: 1.15, ops: 2, remarks: 'Pattern embroidery stitch' },
      { id: 'j-7', seq: 7, name: 'Attach Back Pockets to Back Panel', machine: 'SNLS', section: 'Back', smv: 1.40, ops: 3, remarks: 'Reinforce upper corners' },
      { id: 'j-8', seq: 8, name: 'Back Yoke Join with Lap Seam', machine: 'FEED-OFF-ARM', section: 'Back', smv: 0.95, ops: 2, remarks: 'Chainstitch 3-needle' },
      { id: 'j-9', seq: 9, name: 'Back Rise Join', machine: 'FEED-OFF-ARM', section: 'Back', smv: 0.65, ops: 1, remarks: 'Fell seam run' },
      { id: 'j-10', seq: 10, name: 'Inseam Join with Felling', machine: 'FEED-OFF-ARM', section: 'Assembly', smv: 1.30, ops: 3, remarks: 'Heavy denim 13oz' },
      { id: 'j-11', seq: 11, name: 'Outseam Overlock & Safety Stitch', machine: 'OL-5D', section: 'Assembly', smv: 1.10, ops: 2, remarks: 'Press open & split' },
      { id: 'j-12', seq: 12, name: 'Continuous Waistband Attach', machine: 'KANSAI', section: 'Assembly', smv: 1.20, ops: 2, remarks: 'Waistband folder machine' },
      { id: 'j-13', seq: 13, name: 'Attach 5 Belt Loops', machine: 'BARTACK', section: 'Assembly', smv: 0.80, ops: 2, remarks: 'Automatic loop cutter' },
      { id: 'j-14', seq: 14, name: 'Bottom Hem Chainstitch', machine: 'SNLS', section: 'Finishing', smv: 0.75, ops: 2, remarks: 'Roping effect cylinder bed' }
    ]
  },
  {
    id: 'style-shirt-04',
    name: "Men's Formal Woven Shirt",
    styleCode: 'FS-320',
    lineNo: 'Line 01',
    buyer: 'Tommy Hilfiger / PVH',
    targetHourly: 140,
    workingHours: 8,
    targetEfficiency: 88,
    hourlyOutputs: [130, 138, 142, 140, 137, 141, 144, 136],
    downtimeLogs: [],
    operations: [
      { id: 's-1', seq: 1, name: 'Collar Leaf Runstitch & Point Turn', machine: 'SNLS', section: 'Collar & Cuff', smv: 0.85, ops: 2, remarks: 'Use collar corner turner' },
      { id: 's-2', seq: 2, name: 'Collar Band Stitch with Interlining', machine: 'SNLS', section: 'Collar & Cuff', smv: 0.75, ops: 2, remarks: 'Gauge 1/16" topstitch' },
      { id: 's-3', seq: 3, name: 'Collar Leaf Insert into Band', machine: 'SNLS', section: 'Collar & Cuff', smv: 0.90, ops: 2, remarks: 'Symmetrical point test' },
      { id: 's-4', seq: 4, name: 'Cuff Prep & Runstitch', machine: 'SNLS', section: 'Collar & Cuff', smv: 0.70, ops: 1, remarks: 'Both left & right cuffs' },
      { id: 's-5', seq: 5, name: 'Front Button Placket Make', machine: 'SNLS', section: 'Front', smv: 0.65, ops: 1, remarks: 'Fused interlining placket' },
      { id: 's-6', seq: 6, name: 'Chest Pocket Hem & Attach', machine: 'SNLS', section: 'Front', smv: 0.80, ops: 2, remarks: 'V-shaped pocket bottom' },
      { id: 's-7', seq: 7, name: 'Back Yoke Join with Sandwich Seam', machine: 'SNLS', section: 'Back', smv: 0.75, ops: 2, remarks: 'Double yoke construction' },
      { id: 's-8', seq: 8, name: 'Sleeve Placket (Churidar/Tower)', machine: 'SNLS', section: 'Component', smv: 1.10, ops: 2, remarks: 'Clean triangle point' },
      { id: 's-9', seq: 9, name: 'Shoulder Join', machine: 'SNLS', section: 'Assembly', smv: 0.50, ops: 1, remarks: 'Concealed seam inside yoke' },
      { id: 's-10', seq: 10, name: 'Collar Attach to Neck & Topstitch', machine: 'SNLS', section: 'Assembly', smv: 1.20, ops: 3, remarks: 'Critical quality operation' },
      { id: 's-11', seq: 11, name: 'Sleeve Setting into Armhole', machine: 'SNLS', section: 'Assembly', smv: 1.15, ops: 2, remarks: 'Single needle french fell' },
      { id: 's-12', seq: 12, name: 'Side Seam & Underarm Fell Run', machine: 'FEED-OFF-ARM', section: 'Assembly', smv: 1.05, ops: 2, remarks: 'Twin needle lap seam' },
      { id: 's-13', seq: 13, name: 'Cuff Attach to Sleeve', machine: 'SNLS', section: 'Assembly', smv: 0.95, ops: 2, remarks: 'Pleats distribution uniform' },
      { id: 's-14', seq: 14, name: 'Bottom Hem Roll Stitch', machine: 'SNLS', section: 'Finishing', smv: 0.65, ops: 1, remarks: 'Curved shirt bottom hemmer' }
    ]
  }
];
