import os
import glob
import re

posts = glob.glob('src/content/posts/*.md')

for filepath in posts:
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    in_frontmatter = False
    date_line_index = -1
    
    for i, line in enumerate(lines):
        if line.startswith('---'):
            in_frontmatter = not in_frontmatter
            continue
        if in_frontmatter and line.startswith('date:'):
            date_line_index = i
            break
    
    if date_line_index >= 0:
        date_line = lines[date_line_index]
        
        # 提取 ISO 日期格式
        date_match = re.search(r'(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+\d{2}:\d{2}', date_line)
        if date_match:
            year = date_match.group(1)
            month = date_match.group(2)
            day = date_match.group(3)
            
            # 简化回标准日期格式
            new_date = 'date: {}-{}-{}'.format(year, month, day)
            lines[date_line_index] = new_date + '\n'
            
            print('{}: {} -> {}'.format(os.path.basename(filepath), date_match.group(0), new_date))
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)

print('Done!')