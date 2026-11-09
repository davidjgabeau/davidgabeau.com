# What Agents Can Learn From Working Together

By David Gabeau

Published: 2026-11-09
Canonical URL: https://davidgabeau.com/writing/what-agents-can-learn-from-working-together
Author: https://davidgabeau.com/

I recently met [Catherine Liang](https://qiyaoliang.com/) at a lunch organized by [Gopal Raman](https://www.southparkcommons.com/team/gopal) of [SPC](https://www.southparkcommons.com/). She spent some time building and testing agents designed to play games like real players for a popular gaming company.

She shared that experienced human players can still tell when they're playing against AI, but since [Astra](https://openai.com/index/gpt-6-astra/), agents have become increasingly good at playing alongside less experienced humans without being detected.

We agreed that distinguishing between humans and agents in some digital spaces may eventually become possible but beside the point. Most users won't care whether they're interacting with an agent if the experience is good.

I've long been interested in the relationship between humans and multiplayer agents. My startup, [Zumi](https://blog.usetapestry.dev/p/introducing-zumi-20), was an attempt to create a simulated world where users could watch their AI companions play and grow.

Users spent an average of 17 minutes a day talking to and playing with their Zumi, but we couldn't reliably build agents that **worked together to build things** in their world at scale. We could simulate this behavior through generative stories, but the models weren't yet good enough to autonomously create coherent, enduring storylines.

This is changing rapidly.

Catherine has been exploring multiplayer agent collaboration. Her research, [_World of SWECraft: Agent Collaboration at Scale via Simulated Software Worlds_](https://arxiv.org/abs/2610.24061), studies what happens when agents are given responsibility for maintaining interconnected software packages, discovering their own tasks, and collaborating with other agents.

[![Figure 1 from World of SWECraft: a diagram of agents maintaining interconnected Python packages beside a graph comparing downstream speedups with and without collaboration.](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/software-world-overview.webp)](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/software-world-overview.webp)

Agents maintain connected software packages, with improvements measured on software they cannot see. [Shen et al., World of SWECraft, Figure 1](https://arxiv.org/pdf/2610.24061v2#page=1) (2026). [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Click to enlarge.

My takeaway is that agents work together much like humans: they do well with clear goals and ownership but struggle to allocate shared resources democratically.

More work generally produced better results, but _more communication_ didn't necessarily improve collaboration.

Feedback from other agent maintainers helped agents find bugs they might have missed alone, similar to a good code review.

[![Figure 7 from World of SWECraft: interaction networks for forced communication and mixed-model teams, alongside a chart showing no performance gain from forced communication for Sol.](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/communication-experiment.webp)](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/communication-experiment.webp)

More communication did not automatically improve results. [Shen et al., World of SWECraft, Figure 7](https://arxiv.org/pdf/2610.24061v2#page=8) (2026). [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Click to enlarge.

Surprisingly, some of the strongest frontier models stopped looking for work even when there was still more to do. Just because a team of agents could solve a problem, it seems, didn't mean they would find one worth solving.

[![Figure 4 from World of SWECraft: downstream speedup versus tokens with default and discovery prompts. Some models improve with discovery prompts while Astra remains nearly flat.](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/task-discovery.webp)](https://davidgabeau.com/writing/what-agents-can-learn-from-working-together/images/task-discovery.webp)

Asking models to keep exploring helped some find more work, but gains varied. [Shen et al., World of SWECraft, Figure 4](https://arxiv.org/pdf/2610.24061v2#page=6) (2026). [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). Click to enlarge.

The fact agents can already discover meaningful improvements through autonomous collaboration makes me optimistic about what we'll be able to build as these systems improve. Like effective human teams, agents benefit from clear goals, roles, and responsibilities.

You should read the [full paper](https://arxiv.org/abs/2610.24061), try [Software World](https://www.swecraft.world/), and [follow Catherine](https://x.com/catherineliangq) as she continues exploring these ideas.
