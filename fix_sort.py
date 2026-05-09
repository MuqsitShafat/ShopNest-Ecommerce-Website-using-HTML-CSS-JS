import re
import io

with io.open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Sorting New Arrivals
start_grid = html.find('<div class="products-grid" id="products-grid">')
end_grid = html.find('</div>\n      </div>\n    </section>', start_grid)
grid_content = html[start_grid:end_grid]

articles = re.findall(r'<article\s+class="product-card".*?</article>', grid_content, re.DOTALL)
def get_title_article(a):
    m = re.search(r'<h3 class="product-name">(.*?)</h3>', a, re.DOTALL)
    if m: 
        title = re.sub(r'\s+', ' ', m.group(1)).strip()
        return title
    return ""

sorted_articles = sorted(articles, key=get_title_article)
new_grid_content = grid_content
for a, sa in zip(articles, sorted_articles):
    new_grid_content = new_grid_content.replace(a, sa, 1)

html = html[:start_grid] + new_grid_content + html[end_grid:]


# Sorting Selected Arrivals
start_sel = html.find('<div class="selected-grid">')
end_sel = html.find('</div>\n      </div>\n    </section>', start_sel)
sel_content = html[start_sel:end_sel]

parts = sel_content.split('<div class="selected-item"')
prefix = parts[0]
items = ['<div class="selected-item"' + p for p in parts[1:]]

def get_title_sel(item):
    m = re.search(r'<h4>(.*?)</h4>', item, re.DOTALL)
    if m:
        t = re.sub(r'\s+', ' ', m.group(1)).strip()
        return t
    return ""

sorted_items = sorted(items, key=get_title_sel)

for i, item in enumerate(sorted_items):
    sorted_items[i] = re.sub(r'<div class="selected-num">\d+</div>', '<div class="selected-num">{0:02d}</div>'.format(i+1), item)

new_sel_content = prefix + "".join(sorted_items)
html = html[:start_sel] + new_sel_content + html[end_sel:]

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
