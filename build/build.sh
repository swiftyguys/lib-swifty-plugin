#!/bin/bash
cmd=(dialog --separate-output --checklist "Build Swifty plugin:" 42 76 36)
# any option can be set to default to "on"
options=(
         . "========================================" off
         . "Main actions:" off
         . "========================================" off
         . "" off
         a "FREE version" off
         b "PRO version" on
         . "----------------------------------------" off
         f "Test the zip" off
         g "Mail the zip" on
         . "----------------------------------------" off
         1 "Get latests masters and develops" off
         2 "Update pot/po and up/download glotpress" off
         3 "Build" off
         4 "Release to public" off
         5 "Commit + tag + push" off
         . "" off
         . "========================================" off
         . "Individual actions (some can be combined):" off
         . "========================================" off
         . "" off
         k "Pull all masters" off
         l "Merge all develops" off
         m "Build DIST version" off
         n "And make it PRO version" off
         o "Test" off
         p "Send email" off
         q "SVN update" off
         r "SVN submit" off
         s "Release on swiftylife.com" off
         t "Commit and tag" off
         u "Create pot and upload to glotpress" off
         v "Download po from glotpress" off
         w "Commits since tag" off
        )
choices=$("${cmd[@]}" "${options[@]}" 2>&1 >/dev/tty)
clear
startgruntcmd="from_dialog_do"
gruntcmd=$startgruntcmd
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
            ;;
        2)
            sss="_mainpot"
            gruntcmd=$gruntcmd$sss
            ;;
        3)
            sss="_mainbuild"
            gruntcmd=$gruntcmd$sss
            ;;
        4)
            sss="_mainrelease"
            gruntcmd=$gruntcmd$sss
            ;;
        5)
            sss="_maintag"
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
        w)
            sss="_commitssincetag"
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