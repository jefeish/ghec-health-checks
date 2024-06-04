# Check if a License file exists in the repository and create a badge for it

# check if a license file exists in the repository
if [ -f LICENSE ]; then

  LICENSE_TYPE=$(head -n 1 LICENSE | awk '{print $1}')
  echo "LICENSE_TYPE: $LICENSE_TYPE"    

  license_badge=""

  # create a badge for the license
    if [ "$LICENSE_TYPE" == "MIT" ]; then
        echo "License: MIT"
        license_badge="![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)"
    elif [ "$LICENSE_TYPE" == "Apache" ]; then
        echo "License: Apache"
        license_badge="![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)"
    else
        echo "License: $LICENSE_TYPE"
        license_badge="![License](https://img.shields.io/badge/License-$LICENSE_TYPE-blue.svg)"
    fi

    echo $license_badge > LICENSE_BADGE.md
else
  echo "License file not found"
fi

# check if a package file exists in the repository
if [ -f package.json ]; then

  node_version=$(jq -r '.engines.node' package.json | tr ' ' '_')
  echo "Node Version: $node_version"
  node_version_badge="![License](https://img.shields.io/badge/Node-$node_version-mediumslateblue.svg)"
  echo "$node_version_badge" > VERSION_BADGE.md
fi