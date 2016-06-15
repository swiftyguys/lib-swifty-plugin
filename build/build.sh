#!/bin/bash
cmd=(dialog --separate-output --checklist "Build Swifty plugin:" 42 76 36)
# any option can be set to default to "on"
options=(
         . "========================================" off
         . "Main actions:" off
         . "========================================" off
         . "" off
         1 "Get latests masters and develops" off
         2 "Show commit log since latest changelog" off
         3 "Update pot/po and up/download glotpress" off
         4 "Update documentation" off
         5 "Build" off
         6 "Commit + tag + push" off
         7 "Release to public" off
         . "" off
         . "----------------------------------------" off
         . "" off
         f "Test the zip" off
         g "Mail the zip" on
         . "" off
         . "========================================" off
         . "Individual actions (some can be combined):" off
         . "========================================" off
         . "" off
         a "FREE version" on
         b "PRO version" off
         k "Pull all masters" off
         l "Merge all develops" off
         m "Build DIST version" off
         o "Test" off
         p "Send email" off
         q "SVN update" off
         r "SVN submit" off
         s "Release on swifty.online" off
         t "Commit and tag" off
         u "Create pot and upload to glotpress" off
         v "Download po from glotpress" off
        )
choices=$("${cmd[@]}" "${options[@]}" 2>&1 >/dev/tty)
clear
startgruntcmd="from_dialog_do"
gruntcmd=$startgruntcmd
singlecmd=""
for choice in $choices
do
    case $choice in
        a)
            sss="_mainvfree"
            gruntcmd=$gruntcmd$sss
            ;;
        b)
            sss="_mainvpro"
            gruntcmd=$gruntcmd$sss
            ;;
        f)
            sss="_maintest"
            gruntcmd=$gruntcmd$sss
            ;;
        g)
            sss="_mainmail"
            gruntcmd=$gruntcmd$sss
            ;;
        1)
            sss="_mainpull"
            gruntcmd=$gruntcmd$sss
            singlecmd=$sss
            ;;
        2)
            sss="_commitssincetag"
            gruntcmd=$gruntcmd$sss
            singlecmd=$sss
            ;;
        3)
            sss="_mainpot"
            gruntcmd=$gruntcmd$sss
            singlecmd=$sss
            ;;
        4)
            sss="_async_export_docs"
            gruntcmd=$gruntcmd$sss
            singlecmd=$sss
            ;;
        5)
            sss="_mainbuild"
            gruntcmd=$gruntcmd$sss
            ;;
        6)
            sss="_maintag"
            gruntcmd=$gruntcmd$sss
            singlecmd=$sss
            ;;
        7)
            sss="_mainrelease"
            gruntcmd=$gruntcmd$sss
            ;;
        k)
            sss="_pullall"
            gruntcmd=$gruntcmd$sss
            ;;
        l)
            sss="_mergedev"
            gruntcmd=$gruntcmd$sss
            ;;
        m)
            sss="_dist"
            gruntcmd=$gruntcmd$sss
            ;;
        n)
            sss="_pro"
            gruntcmd=$gruntcmd$sss
            ;;
        o)
            sss="_test"
            gruntcmd=$gruntcmd$sss
            ;;
        p)
            sss="_mail"
            gruntcmd=$gruntcmd$sss
            ;;
        q)
            sss="_svnupdate"
            gruntcmd=$gruntcmd$sss
            ;;
        r)
            sss="_svnsubmit"
            gruntcmd=$gruntcmd$sss
            ;;
        s)
            sss="_releaseswiftylife"
            gruntcmd=$gruntcmd$sss
            ;;
        t)
            sss="_commitandtag"
            gruntcmd=$gruntcmd$sss
            ;;
        u)
            sss="_createpot"
            gruntcmd=$gruntcmd$sss
            ;;
        v)
            sss="_gettranslations"
            gruntcmd=$gruntcmd$sss
            ;;
    esac
done
if [ "$singlecmd" != "" ]
then
    gruntcmd=$startgruntcmd$singlecmd
fi
if [ "$gruntcmd" != "$startgruntcmd" ]
then
    echo "#"
    echo "# grunt $gruntcmd"
    echo "#"
    bash -c "grunt $gruntcmd"
fi