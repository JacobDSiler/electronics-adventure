# Electronics Adventure

A homeschool electives app: transistor logic, latches, chips and sonar for ages 2-10.
Sibling to Math Adventure and Words Adventure. Vanilla JS PWA, no build step.

- 7 quests, 24 interactive labs, 35 hands-on sessions, quizzes and badges
- Four bands: Sprout (2-3), Spark (4-6), Maker (7-8), Engineer (9-10)
- Shares family codes with Math/Words (progress stored in `families/{code}_ea`)
- Harbor deep link: `?from=harbor&family=CODE&child=ID&view=parent`
- Parent area: PIN, lesson plan, parts checklist, safety, backup

Deploy: double-click `push.cmd` (or `scripts\ea-start-watcher.cmd` for auto-deploy).
Hosted at https://electronics.jacobsiler.com (GitHub Pages + CNAME).
Firestore rules must allow `families/{code}_ea` (see firebase-rules).
