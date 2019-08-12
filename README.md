# Solution with appname and package name changes in entire app, with the help of a npm package which is "react-native-rename"


#IMPORTANT NOTE:
You just need to do one manual change only i,e to add the MainApplication.java and MainActivity.java file, best thing is just take the
backup of these file on your local system before doing the below process and then again add these files and then change the package name
in both file with the name changed in android manifest after completeing the process, also one more think and i,e dont forget to return
the same app name  in  @Override method in MainActivity.java after you rename it.

since this is one of the good way to rename you packages and app name otherwise you if are trying to change it manually you have to do many changes in your native files 


# STEP 1 : 

yarn global add react-native-rename
or
npm install react-native-rename -g


# STEP 2:

run the command  react-native-rename <newName> 

ex: react-native-rename "Business App" , where Business App  is you rename of your app

and With custom Bundle Identifier (Android only. For iOS, please use Xcode)

react-native-rename <newName> -b <bundleIdentifier>

ex: react-native-rename "Travel App" -b com.junedomingo.travelapp



# STEP 3

run your project 
react-native run-android 

or 

react-native run-ios

# STEP 4

if you are getting error in your build then just do few thing like

a) react-native link
b) clean your project with  : cd android && gradlew clean
   and then build you project with the above command
