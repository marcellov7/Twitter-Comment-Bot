import axios from "axios";
import { TwitterApi } from 'twitter-api-v2';

const twitterConsumerKey = "cxsIKc9WjK0xjPC0YCGF64FDA";
const twitterConsumerSecret = "q4YaxHHuemTyaaAT4M8JeTxNAWFSc2uzZxz6CUuX62ynnL83DH";
const twitterAccessToken = "928606294021410816-kvF36C94qUVc7jAUMt04eWszYMogpbJ";
const twitterAccessTokenSecret = "9PXg4iYOkQL96YaAyLq0WeruzzwbfOK2aYo1PYc9EeoE5";
const openaiApiKey = "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";

function getKeyword() {
  const keywords = [
    // Core Streaming Technology
    "videostreaming",
    "streamingplatform",
    "saas",
    "cloudcomputing",
    "videotechnology",
    "contentcreator",
    "livestreaming",
    
    // Technical Specifications
    "rtmp",
    "hlsstreaming",
    "dashstreaming",
    "webrtc",
    "lowlatency",
    "adaptivebitrate",
    "cdndelivery",
    
    // Security & Protection
    "drm",
    "drmprotection",
    "widevinedrm",
    "fairplaydrm",
    "contentprotection",
    "geoblocking",
    
    // OTT Related
    "ott",
    "ottplatform",
    "ottmarket",
    "ottwhitelabel",
    "ottmonetization",
    "ottsolutions",
    
    // Video Processing
    "encoding",
    "transcoding",
    "videoquality",
    "4kstreaming",
    "multibitrate",
    "videocompression",
    
    // Business Solutions
    "streamingsolutions",
    "whitelabelsaas",
    "mediamanagement",
    "contentdelivery",
    "streaminganalytics",
    "liveevent",
    
    // Industry Specific
    "sportstreaming",
    "sportlive",
    "liveeventstreaming",
    "corporatestreaming",
    "educationstreaming",
    "videointranet",
    "intranetvideo",
    
    // Features
    "multidevicestreaming",
    "vodplatform",
    "catchupTV",
    "timeshift",
    "cloudrecording",
    
    // Infrastructure
    "streamingarchitecture",
    "scalablestreaming",
    "hybridcdn",
    "edgecomputing",
    "p2pstreaming",
    
    // Analytics & Monitoring
    "streaminganalytics",
    "qoeanalytics",
    "vieweranalytics",
    "streamingmetrics",
    "qualitymonitoring",
    "videomonitoring",
    "videostreaming"
  ];
  const index = Math.floor(Math.random() * keywords.length);
  return keywords[index];
}

const twitterClient = new TwitterApi({
  appKey: twitterConsumerKey,
  appSecret: twitterConsumerSecret,
  accessToken: twitterAccessToken,
  accessSecret: twitterAccessTokenSecret,
});

async function searchAndComment() {
  try {
    console.log("Searching for tweets...");
    const query = getKeyword();
    const maxTweets = 100;

    const tweets = await twitterClient.v2.search({
      query: query,
      max_results: maxTweets,
      "tweet.fields": ["author_id", "referenced_tweets"],
      expansions: ["author_id"],
      "user.fields": ["username"]
    });

    const tweetData = tweets.data || [];
    console.log(`Found ${tweetData.length} tweets. Generating comments...`);

    for (const tweet of tweetData) {
      try {
        // Skip retweets and replies
        if (tweet.referenced_tweets?.some(t => t.type === "retweeted")) {
          continue;
        }

        const { data: response } = await axios.post(
          "https://api.openai.com/v1/completions",
          {
            model: "text-davinci-003",
            prompt: `Comment on this tweet: "${tweet.text}", the reply to this tweet must be like i am writing it and also include some emoji that matches the generated text`,
            max_tokens: 70,
            temperature: 0.5,
            top_p: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openaiApiKey}`,
            },
          }
        );

        const comment = response.choices[0].text.trim();
        console.log(comment);

        // Get the username for the tweet author
        const author = tweets.includes.users.find(user => user.id === tweet.author_id);
        const username = author.username;

        // Post the reply
        const reply = await twitterClient.v2.reply(
          `@${username} ${comment}`,
          tweet.id
        );

        console.log(`Comment posted: ${reply.data.text}`);
        
        // Delay each iteration for 30min
        await new Promise((resolve) => setTimeout(resolve, 120 * 60 * 1000));
      } catch (error) {
        console.error("Error processing tweet:", error);
        continue;
      }
    }
  } catch (error) {
    console.error("Error in search and comment:", error);
  }
  
  // Recursively call the function
  searchAndComment();
}

searchAndComment();
