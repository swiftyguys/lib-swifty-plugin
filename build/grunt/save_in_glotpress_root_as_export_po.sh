#!/bin/bash

rm -Rf temp_$1
mkdir temp_$1

array=( $2 )
for i in "${array[@]}"
do
    echo $i
    php scripts/export.php -p $1 -l $i > temp_$1/$i.po
done

zip -r temp_$1.zip temp_$1

rm -Rf temp_$1
