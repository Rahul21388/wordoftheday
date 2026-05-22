# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# react-native-nitro-modules (used by react-native-iap v15)
-keep class com.margelo.nitro.** { *; }
-keep class com.margelo.nitro.core.** { *; }
-dontwarn com.margelo.nitro.**

# react-native-iap
-keep class com.dooboolab.RNIap.** { *; }
-dontwarn com.dooboolab.RNIap.**

# Google Mobile Ads (AdMob)
-keep class com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }
-dontwarn com.google.android.gms.ads.**

# Keep JS interface bridges intact so R8 doesn't strip them
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod *;
}

# Add any project specific keep options here:
