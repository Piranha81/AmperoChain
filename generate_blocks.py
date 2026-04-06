import openpyxl, re

wb = openpyxl.load_workbook(r'c:\Users\Roberto\Desktop\ampero_effects_complete_upd.xlsx')
ws = wb.active

category_type_map = {
    'I/O': 'io',
    'DYN': 'dyn',
    'Acoustic': 'acoustic',
    'WAH': 'wah',
    'DRV': 'drive',
    'AMP': 'amp',
    'PRE AMP': 'preamp',
    'CAB': 'cab',
    'EQ': 'eq',
    'MOD': 'modulation',
    'DLY': 'delay',
    'REV': 'reverb',
    'FREQ': 'freq',
    'FX LOOP': 'fxloop',
    'FX RTN': 'fxrtn',
    'FX SND': 'fxsnd',
    'IR': 'ir',
    'Sound Clone': 'soundclone',
    'VOL': 'vol',
    'RVB': 'reverb',
    'Power Amp': 'poweramp',
}

def slugify(name):
    s = name.lower().strip()
    s = re.sub(r'[^a-z0-9\s~]', '', s)
    s = re.sub(r'\s+', '-', s)
    s = s.strip('-')
    return s

def escape_ts_string(s):
    s = str(s)
    s = s.replace('\\', '\\\\')
    s = s.replace("'", "\\'")
    s = s.replace('\n', ' ')
    s = s.replace('\r', '')
    s = s.replace('\t', ' ')
    s = re.sub(r'\s+', ' ', s)
    s = s.strip()
    return s

def get_cab_subcategory(name, desc):
    name_lower = name.lower()
    desc_lower = desc.lower()
    if 'acoustic' in name_lower or 'h-bird' in desc_lower or 'hum bird' in name_lower:
        return 'Acoustic IR'
    if ' ir ' in desc_lower or 'celestion' in desc_lower:
        if 'close' in name_lower or 'open' in name_lower or 'g12' in name_lower or 'v30' in name_lower or 'green' in name_lower or 'blue' in name_lower:
            return 'Celestion IR'
    if 'bass' in name_lower or 'ampage' in name_lower:
        return 'Bass Cab'
    if 'user ir' in name_lower:
        return 'Celestion IR'
    if re.search(r'[12]x[102]', name_lower):
        return 'Guitar Cab S'
    if re.search(r'4x[102]', name_lower):
        return 'Guitar Cab L'
    return 'Guitar Cab S'

blocks = []
seen_ids = set()

for row in ws.iter_rows(min_row=2, values_only=True):
    cat = str(row[0]) if row[0] else ''
    subcat = str(row[1]) if row[1] else ''
    name = str(row[2]) if row[2] else ''
    cpu = row[3] if len(row) > 3 else 1
    desc = str(row[4]) if len(row) > 4 else ''

    if not name.strip():
        continue

    block_type = category_type_map.get(cat, cat.lower())
    eff_id = slugify(name)

    base_id = eff_id
    counter = 1
    while eff_id in seen_ids:
        eff_id = f'{base_id}-{counter}'
        counter += 1
    seen_ids.add(eff_id)

    if cat == 'CAB' and (len(subcat) > 60 or 'Mic Type' in subcat):
        subcat = get_cab_subcategory(name, desc)

    compute_weight = int(cpu) if isinstance(cpu, (int, float)) else 1

    blocks.append({
        'id': eff_id,
        'name': escape_ts_string(name),
        'type': block_type,
        'category': cat,
        'subcategory': escape_ts_string(subcat) if subcat != 'None' else '',
        'description': escape_ts_string(desc),
        'computeWeight': compute_weight,
    })

output_path = r'C:\Progetti\TestAmpero\src\data\blocks.ts'

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("import { AudioBlock } from '../types/audio';\n\n")
    f.write('export const blockLibrary: AudioBlock[] = [\n')

    for i, b in enumerate(blocks):
        comma = ',' if i < len(blocks) - 1 else ''
        f.write('  {\n')
        f.write(f"    id: '{b['id']}',\n")
        f.write(f"    name: '{b['name']}',\n")
        f.write(f"    type: '{b['type']}',\n")
        f.write(f"    computeWeight: {b['computeWeight']},\n")
        f.write(f"    category: '{b['category']}',\n")
        f.write(f"    subcategory: '{b['subcategory']}',\n")
        f.write(f"    description: '{b['description']}',\n")
        f.write(f'  }}{comma}\n')

    f.write('];\n\n')
    f.write('export function getBlockById(id: string): AudioBlock | undefined {\n')
    f.write('  return blockLibrary.find((block) => block.id === id);\n')
    f.write('}\n')

print(f'Generated {len(blocks)} blocks to {output_path}')
