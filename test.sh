npm audit --production --json | tee audit-results.json

# Extract info vulnerability count
info=$(jq -r '.metadata.vulnerabilities.info' audit-results.json)
if [ $info -ne 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-info:$info-darkgreen)" > audit-badge.md
fi

# Extract low vulnerability count
low=$(jq -r '.metadata.vulnerabilities.low' audit-results.json)
if [ $low -ne 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-low:$low-CA6F1E)" >> audit-badge.md
fi

# Extract moderate vulnerability count
moderate=$(jq -r '.metadata.vulnerabilities.moderate' audit-results.json)
if [ $moderate -ne 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-moderate:$moderate-CA6F1E)" >> audit-badge.md
fi

# Extract high vulnerability count
high=$(jq -r '.metadata.vulnerabilities.high' audit-results.json)
if [ $high -ne 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-high:$high-darkred)" >> audit-badge.md
fi

# Extract critical vulnerability count
critical=$(jq -r '.metadata.vulnerabilities.critical' audit-results.json)
if [ $critical -ne 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-critical:$critical-darkred)" >> audit-badge.md
fi

# Extract total vulnerability count
total=$(jq -r '.metadata.vulnerabilities.total' audit-results.json)
if [ $total -eq 0 ]; then
echo "![npm audit](https://img.shields.io/badge/npm_audit-pass-green)" >> audit-badge.md
fi

# Define the pattern to search for
pattern='\!\[npm audit\]'

# Create a temporary file to store modified content
tmp_file=$(mktemp)

# Use grep to filter out lines not matching the pattern and write to the temporary file
grep -v "^${pattern}" README.md > "$tmp_file"

# Overwrite README.md with content from the temporary file
mv "$tmp_file" README.md

badge_content=$(cat audit-badge.md)
readme_content=$(cat README.md)
echo "$badge_content" > new_readme.md
echo "$readme_content" >> new_readme.md
mv new_readme.md README.md
rm audit-badge.md  # Clean up temporary badge file