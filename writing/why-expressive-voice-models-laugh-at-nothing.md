# Why Expressive Voice Models Laugh at Nothing

By David Gabeau

Published: 2026-11-27
Canonical URL: https://davidgabeau.com/writing/why-expressive-voice-models-laugh-at-nothing
Author: https://davidgabeau.com/

I attended [Decagon’s Voice and Audio Research Night](https://luma.com/j3ddfdsw) a few weeks ago.

Iterations of voice agents have been interesting to me since building the AI companion, [Zumi](https://davidgabeau.com/writing/zumi-learnings). Adding and improving voice in Zumi gave us our single largest retention boost. At the time, Zumi ran on OpenAI’s [gpt-realtime-2.1](https://developers.openai.com/api/docs/models/gpt-realtime-2.1), a frontier voice model from this summer with a [published turn-taking latency of 1.41 seconds](https://openai.com/index/introducing-gpt-live-1-in-the-api/). This was much more immersive than earlier versions, and some users spent hours a day talking to their Zumi in voice mode.

Under a year later, however, the industry has already pushed well past those benchmarks - conversation with AI can feel almost as natural as with a human.

To unpack where things are heading, Decagon brought together three researchers exploring voice from different angles:

-   [Dante Everaert](https://www.linkedin.com/in/dante-everaert/) [(Decagon)](https://decagon.ai/) on conversational voice-agent architecture.
-   [Nishant Nikhil](https://nishnik.com/) ([Meta Superintelligence Labs](https://ai.meta.com/)) on designing synthetic voices for characters.
-   [Timothy Luong](https://www.linkedin.com/in/timluong/) [(Cartesia)](https://cartesia.ai/) on evaluating voice models in real conversations.

For this piece, I’m focusing on Nishant Nikhil’s work turning text into customizable voices for [Meta’s Muse app](https://about.fb.com/news/2026/11/introducing-muse-ai-voice-expressive-avatars/). He was kind enough to publish his talk on his personal website [here](https://nishnik.com/tts/).

Meta is one of the few major companies building voice agents for entertainment rather than pure productivity. You might assume that a playful context gives voice models more grace with humans when they don’t quite feel right, but the opposite is often true. When talking to an embodied character, the bar is actually higher for users because any flaw immediately breaks immersion.

That pressure for voice models to feel lifelike pushes the training frontier, sometimes to surprising results: Nishant shared that when researchers train voice models to be more expressive, the models often overcorrect by learning to laugh frequently, even when nothing funny has happened. The voice itself might sound more human, but the conversation feels distinctly less natural.

## How voice design breaks standard Text-To-Speech assumptions

Nishant came to Meta’s Superintelligence Lab through the [acquisition of PlayAI](https://nishnik.com/), where he spent his early career building text-to-speech models (TTS). Today he focuses on voice design, which means taking simple prompts like a user typing "gruff, scary pirate" and generating a voice that nails the accent and pitch, sure, but more impressively, the emotion of said pirate.

Under the hood, the architecture is straightforward: a frozen text encoder like [Llama](https://www.llama.com/) or [T5](https://research.google/blog/exploring-transfer-learning-with-t5-the-text-to-text-transfer-transformer/) reads the voice description and [cross-attends](https://arxiv.org/abs/1706.03762) to the transcript to produce the audio. Keeping the encoder frozen saves on training compute, and the setup works well enough on paper. According to Nishant, the bottleneck is the data and how you train the model.

Compared to standard TTS datasets, datasets for voice design are tiny. Most researchers try to bridge that gap by running existing audio through an LLM to bin speakers into attribute labels (e.g., "slow, monotone, low pitch"). That can bootstrap supervised fine-tuning well enough, but quickly runs into the limits of real-world voice data when applied, like:

-   **Unique speaker traits:** A naturally speedy talker rarely has slow samples in their training set, so the model may struggle to separate a speaker's identity from their default pacing.
-   **Missing edge cases:** Combinations like a very high-pitched adult man or a very low-pitched adult woman are rare in natural data (but not rare amongst 8b people!). Prompts can also inherit real-world biases, like defaulting to a female voice whenever a user asks for a "nurse" or a male when prompted with “firefighter.”
-   **Rigid Characters:** The model handles simple tweaks like "talk slowly" without much trouble, but can hit a wall when asked to invent a brand new character or archetype. If it has only seen pirates and villains in training, asking for a fairy is a tall order.

Users building fictional characters actively want edge cases to build the uniqueness of their fantasies. Standard data distributions fight against inherent human creativity.

## The Reinforcement Learning trap and Confounding Rewards

Due to the relatively few voice design datasets, teams will turn to synthetic data to train voice models. However, synthetically labeled Supervised Fine Tuning (SFT) data also quickly hits a ceiling. Teams then turn to [reinforcement learning](https://spinningup.openai.com/en/latest/spinningup/rl_intro.html) to push the synthetic data quality further.

In standard TTS training, RL is relatively clean. You optimize for a few clear, independent signals: word or character accuracy, speaker similarity, consistency, and human preference.

But voice design breaks that playbook in a couple of ways.

First, you don't want one singular “accurate” target. If a user prompts the model for a "pirate voice" five times, it should generate five distinct voices that could all fit the description without ever repeating voices.

Second, the reward signals can actively fight each other. In voice design, you are juggling pitch, pacing, accent, emotion, character style, etc. all at once, all while using reward models that weren't originally built for voice design.

If you push the model to be more expressive, it quickly learns that laughing is an easy way to game the expressiveness score, so it starts laughing at inappropriate moments or dropping words. Push for more emotion, and you accidentally warp pitch because excited human speech naturally shifts higher. These are the tradeoffs voice researchers are making when building for voice design.

Nishant noted that the [reward hacking](https://openai.com/index/faulty-reward-functions/) surface area in voice design is massive. Most of his team's work now goes into structuring the RL environment itself. By using staged RL and strict gating so that when the model is being rewarded on one attribute, conflicting reward signals are turned off, they are able to simulate the training environment they need for voice design.

01 / The reward can pull the wrong way

Target

More expression

↗

Shortcut

Laughter at the wrong moment

Target

More emotion

↗

Side effect

Unintended changes in pitch

A conceptual illustration: improving one voice attribute can change another. The reward is a proxy for the experience.

## From clip benchmarks to trajectory evals

During the Q&A, Nishant made a point that I remember learning firsthand from my time shipping voice in production with Zumi. The most important qualities of a speech system are naturalness and intelligibility, yet consistent evaluation is difficult because there are few universally agreed objective criteria.

Today, most teams default to metrics like [word error rate](https://huggingface.co/learn/audio-course/en/chapter5/evaluation) that are easy to measure on a leaderboard but insufficient to judge if the system is working. It is a classic case of [Goodhart's law](https://arxiv.org/abs/1803.04585): when a measure becomes a target, it ceases to be a good measure. "The model spoke in complete sentences" should be the floor for a good user experience.

Voice today looks a lot like coding models a year ago. In software engineering, unit testing alone cannot verify the functionality of a piece of software; it only ensures that the building blocks work independently from each other. Coding evals eventually moved past unit tests to judge the [entire trajectory](https://nishnik.com/tts/#trajreward) a model takes to solve a problem. Voice evals need a similar shift; testing how the pieces integrate and hold up as a full system should be the standard.

02 / Listen beyond the clip

A single clip

### Does it sound right?

Intelligible words. A voice that fits the prompt.

The whole conversation

### Does it hold up?

Natural timing. Consistency across turns. Emotion that fits the moment.

Conceptual evaluation views, not measured results. A good clip is one building block; immersion depends on how the conversation holds together.

Right now, if a model feels odd twelve turns into a real conversation, then it doesn’t matter if it can ace a five-second clip benchmark. People are inclined to look for personality cues even when interacting with computers, just as we do in human social interactions, and they can feel a strong sense of aversion when the conversation feels slightly off.

Whether you are building a support agent or an embodied character like Muse or Zumi, a fun-sounding voice is only half the product. A strong eval framework that captures nuance is necessary to reflect real conversation. The greater the suspension of disbelief, the greater the degree of presence achieved. The real test is whether the model can hold up across a full, nuanced conversation without breaking the spell.
