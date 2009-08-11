/**
 * Appcelerator Titanium Mobile
 * This is generated code. Do not modify. Your changes will be lost.
 * Generated code is Copyright (c) 2009 by Appcelerator, Inc.
 * All Rights Reserved.
 */
#import <Foundation/Foundation.h>

@protocol TitaniumAppAssetResolver
- (NSData*) resolveAppAsset:(NSURL*)url;
- (oneway void)release;
- (id)retain;
@end

@interface ApplicationRouting : NSObject<TitaniumAppAssetResolver> {
}
- (NSData*) resolveAppAsset:(NSURL*)url;
- (NSData*) pageNamedAccounts;
- (NSData*) scriptNamedAccounts;
- (NSData*) pageNamedDM;
- (NSData*) scriptNamedDM;
- (NSData*) pageNamedEditaccounts;
- (NSData*) scriptNamedEditaccounts;
- (NSData*) pageNamedFavorites;
- (NSData*) scriptNamedFavorites;
- (NSData*) scriptNamedHumane;
- (NSData*) scriptNamedHumaneOG;
- (NSData*) scriptNamedJquery_1_3_2;
- (NSData*) scriptNamedJson2;
- (NSData*) pageNamedMessage;
- (NSData*) scriptNamedMessage;
- (NSData*) pageNamedMore;
- (NSData*) scriptNamedMore;
- (NSData*) pageNamedNewaccount;
- (NSData*) scriptNamedNewaccount;
- (NSData*) pageNamedPost;
- (NSData*) scriptNamedPost;
- (NSData*) pageNamedResults;
- (NSData*) scriptNamedResults;
- (NSData*) pageNamedSearch;
- (NSData*) scriptNamedSearch;
- (NSData*) pageNamedSplash;
- (NSData*) scriptNamedSplash;
- (NSData*) styleNamedStyle;
- (NSData*) pageNamedTimeline;
- (NSData*) scriptNamedTimeline;
- (NSData*) pageNamedTrends;
- (NSData*) scriptNamedTrends;
- (NSData*) pageNamedUser;
- (NSData*) scriptNamedUser;

@end
