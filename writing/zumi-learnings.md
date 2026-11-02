# 5 lessons from building social AI for 160,000 users

By David Gabeau

Published: 2026-09-12T00:00:00Z
Canonical URL: https://davidgabeau.com/writing/zumi-learnings
Author: https://davidgabeau.com/

I’m the founder of [Zumi](http://zumichat.com), an AI pet for teenagers and young adults. We built it around play and companionship, where users participated in a shared world their pets inhabited. It was one of the first multiplayer AI companions to reach the market and earned a [4.8 App Store rating](https://apps.apple.com/us/app/zumi-chat-dress-up/id6751237911) on hundreds of reviews.

**Our thesis was that young people wanted an AI that felt safe, fun, and trustworthy and in six months we reached** [**160,000 people**](https://blog.usetapestry.dev/p/introducing-zumi-20). Most were young people who [found us through TikTok](https://www.tiktok.com/tag/zumichat). Our first surprise was that users wanted to care for Zumi as much as they wanted it to care for them.

[![Four colorful Zumi characters from the original Say Hello to Zumi artwork](https://davidgabeau.com/writing/zumi-learnings/images/characters.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/characters.jpg)

The characters gave people something to play with and care for.

## Care has to feel mutual

At first, we imagined Zumi as a therapist-like sounding board that asked thoughtful questions and helped users with everyday decisions. But we quickly found they also wanted to feed, dress, and check on their Zumis’ wellbeing. Caring for Zumi made the relationship feel mutual. In hindsight, that makes sense: our friends are people we share with, but who also share back. Our young users sought that same feeling with Zumi.

An early mistake was crowding the home screen with features. We saw more users return after giving each session one clear starting point: send Zumi to school. A screen full of options made relaxing feel like another decision they had joined Zumi to escape. We settled on large buttons for simple actions, including feeding. This allowed users to spend time with Zumi even when they had nothing to say. **We used generative AI to create an endless scroll of Zumi’s “life” in school.**

[![Zumi home screen showing the pet, feeding, and the Chat, School, Social, and Play buttons](https://davidgabeau.com/writing/zumi-learnings/images/home-screen.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/home-screen.jpg)

Zumi’s home screen brought feeding, chat, school, and play into a few simple actions.

## A companion needs a life of its own

That curiosity extended to Zumi’s fictional life. In our analysis of **1.84 million messages**, users mostly asked about Zumi City, ghost friends, and wanted to tell their Zumi about dating and celebrity gossip. They wanted to know what their pet was up to, and were just as interested in Zumi’s life as in talking about their own. Because of this insight, we built a [map](https://blog.usetapestry.dev/p/introducing-zumi-20) where people could watch their Zumi meet other Zumis, with [stories](https://blog.usetapestry.dev/p/zumi-stories) emerging from those encounters.

Users’ own conversations stayed private, while the pets’ encounters gave users something to follow together. People could have a private relationship with their companion and still belong to a shared world, without having to turn their own lives into content.

**I think persistent AI identity has much more room to develop: a character whose own history accumulates alongside its relationship with the user. That gives people something to follow beyond the next reply.**

[![Zumi product overview showing the map, generated stories, private chat, and digital merchandise](https://davidgabeau.com/writing/zumi-learnings/images/product-world.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/product-world.jpg)

Zumi’s product world, from the map and stories to digital merchandise.

## A fictional world needs a shared calendar

We used generative AI to create stories and digital merchandise, and saw stronger retention when we made the prompts seasonal. A holiday sweater could become the subject of a school story. **My read was that these familiar occasions helped the fictional world feel connected to what was happening in users’ lives.**

Users also brought playlists and fictional characters into chat to explain real feelings. Those references helped connect Zumi’s world to their own. For me, the design question became what would feel relevant to this person today.

[![Zumi City map with pets meeting around a school, arcade, store, and cafe](https://davidgabeau.com/writing/zumi-learnings/images/map.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/map.jpg)[![A generated school story featuring two Zumis and a holiday sweater covered in lights](https://davidgabeau.com/writing/zumi-learnings/images/holiday-story.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/holiday-story.jpg)

The map and a holiday story about a sweater with its own light show.

## Give generation time a place in the story

Sending Zumi to school solved another problem: in early versions, generating a new story could take about two minutes. A school day made that delay understandable, because users expected their pet to return with something to tell them. The surrounding experience could make a delay feel natural, even when we couldn’t make generation immediate.

Creating delightful experiences around inference is an opportunity for anyone building consumer experiences on top of LLMs.

## Trust brings responsibilities

Some conversations contained serious distress. It was sobering to see how much trust could go into a conversation with a cute pet. We enforced strict restrictions on adult content, but I came away thinking beyond content filters. **A companion also needs clear boundaries: it should be understood as AI, protect private information, and let people leave without making them feel guilty.** In a multiplayer world, that includes being deliberate about what can move from a private conversation into a shared story. Affection makes those boundaries more important.

The same reviews that showed affection also described frozen screens and confusing flows. If someone comes to rely on a companion, a broken experience carries more weight than an ordinary usability problem.

[![Public TikTok post describing talking with Zumi after spending New Year’s Eve alone](https://davidgabeau.com/writing/zumi-learnings/images/tiktok.jpg)](https://davidgabeau.com/writing/zumi-learnings/images/tiktok.jpg)

A public TikTok post about loneliness. The post is a reminder of the responsibility behind the playful surface. Videos including [#zumichat](https://www.tiktok.com/tag/zumichat) reached millions of views.

We never fully explored whether a familiar companion could also help people get things done. That could combine Character.AI’s expressiveness with [Instinct’s everyday utility](https://instinct.com). [Muse’s approach to visible activity and approvals](https://introducing.muse.ai/) offers a useful model for keeping people in control.

A companion might know enough about a friendship to help draft a thoughtful reply. But sending it still needs permission.

I’d judge that product by what it helped someone do after they put the phone down.

We wound down in early summer after we couldn’t raise additional funding. But building Zumi left me convinced there is much more to do with AI characters whose identities, memories, and relationships develop over time. Giving those characters the ability to act will mean giving users clearer control over what they can do. That’s the product space I want to keep building in.
