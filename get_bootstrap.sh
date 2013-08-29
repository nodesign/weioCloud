#!/bin/bash

BS_VERSION=3.0.0

mkdir -d bootstrap
cd bootstrap
wget https://github.com/twbs/bootstrap/releases/download/v${BS_VERSION}/bootstrap-${BS_VERSION}-dist.zip
unzip bootstrap-${BS_VERSION}-dist.zip

# Twitter calls this dir just "dist". Give it better name.
mv dist bootstrap

# Remove trash
rm bootstrap-${BS_VERSION}-dist.zip

# Produce test index.html
cd bootstrap/

cat << END > index.html
<!DOCTYPE html>
<head>
    <title>Twitter Bootstrap</title>
    <style type='text/css'></style>

    <link href="css/bootstrap.min.css" rel="stylesheet">
    <script src="js/bootstrap.min.js"></script>

</head>
<body>
    Hello World!
    <button type="button" class="btn">Button</button>
</body>
</html>
END
