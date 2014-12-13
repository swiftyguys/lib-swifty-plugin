#!/bin/bash
cmd=(dialog --separate-output --checklist "Build Swifty plugin:" 42 76 36)
# any option can be set to default to "on"
options=(
         . "========================================" off
         . "Main actions:" off
         . "========================================" off
         . "" off
         1 "Get latests masters and develops (a,b)" off
         . "----------------------------------------" off
         2 "Commit + tag + push ()" off
         . "----------------------------------------" off
         3 "Build + mail FREE version (c,f)" off
         4 "Build + mail PRO version (c,d,f)" off
         . "----------------------------------------" off
         5 "Release FREE to public ()" off
         6 "Release PRO to public (d,i)" off
         . "" off
         . "========================================" off
         . "Individual actions (some can be combined):" off
         . "========================================" off
         . "" off
         a "Pull all masters" off
         b "Merge all develops" off
         c "Build DIST version" off
         d "And make it PRO version" off
         e "Test" off
         f "Send email" off
         g "SVN update" off
         h "SVN submit" off
         i "Release on swiftylife.com" off
         j "Commit and tag" off
        )
choices=$("${cmd[@]}" "${options[@]}" 2>&1 >/dev/tty)
clear
startgruntcmd="from_dialog_do"
gruntcmd=$startgruntcmd
for choice in $choices
do
    case $choice in
        1)
            sss="_mainpull"
            gruntcmd=$gruntcmd$sss
            ;;
        2)
            sss="_maintag"
            gruntcmd=$gruntcmd$sss
            ;;
        3)
            sss="_mainbuildfree"
            gruntcmd=$gruntcmd$sss
            ;;
        4)
            sss="_mainbuildpro"
            gruntcmd=$gruntcmd$sss
            ;;
        5)
            sss="_mainreleasefree"
            gruntcmd=$gruntcmd$sss
            ;;
        6)
            sss="_mainreleasepro"
            gruntcmd=$gruntcmd$sss
            ;;
        a)
            sss="_pullall"
            gruntcmd=$gruntcmd$sss
            ;;
        b)
            sss="_mergedev"
            gruntcmd=$gruntcmd$sss
            ;;
        c)
            sss="_dist"
            gruntcmd=$gruntcmd$sss
            ;;
        d)
            sss="_pro"
            gruntcmd=$gruntcmd$sss
            ;;
        e)
            sss="_test"
            gruntcmd=$gruntcmd$sss
            ;;
        f)
            sss="_mail"
            gruntcmd=$gruntcmd$sss
            ;;
        g)
            sss="_svnupdate"
            gruntcmd=$gruntcmd$sss
            ;;
        h)
            sss="_svnsubmit"
            gruntcmd=$gruntcmd$sss
            ;;
        i)
            sss="_releaseswiftylife"
            gruntcmd=$gruntcmd$sss
            ;;
        j)
            sss="_commitandtag"
            gruntcmd=$gruntcmd$sss
            ;;
    esac
done
if [ "$gruntcmd" != "$startgruntcmd" ]
then
    echo "#"
    echo "# grunt $gruntcmd"
    echo "#"
    bash -c "grunt $gruntcmd"
fi