// Auto-extracted chapter content data
function getChapterContent(id) {
  const chapters = {
    1: {
      subtitle: "Why managing files manually is a nightmare — and what version control actually solves.",
      sections: [
        { type: "text", heading: "The Chaos of Manual Versioning", content: "You've done it. We all have. You finish writing something important and save it as 'final.doc'. Then you change your mind and save it as 'final_v2.doc'. A week later: 'final_v2_REALLY_FINAL.doc'. Before long, your desktop looks like a graveyard of abandoned drafts. Now imagine this across an entire codebase, with 10 developers, all making changes simultaneously. Pure chaos." },
        { type: "keypoints", heading: "The Problems with Manual Versioning", points: [
          "Which version is actually the latest? You can never be sure.",
          "Merging changes from two people requires manually comparing files line by line.",
          "If you delete something and realize you need it back — it's gone forever.",
          "There's no record of WHY a change was made, only what changed.",
          "Sharing the project means emailing zip files or copying to shared drives.",
        ]},
        { type: "analogy", content: "Imagine writing a novel and saving a new copy of the entire manuscript every time you changed a word. After 6 months, you have 847 copies of 'novel.doc' and you have no idea what changed between them. Version control solves this by tracking every single change automatically, with full context." },
        { type: "text", heading: "Enter Version Control", content: "Version Control Systems (VCS) solve all of these problems. They automatically track every change to every file in your project. They remember who made each change, when they made it, and what message they left explaining why. Most importantly, they let multiple people work on the same project simultaneously without stepping on each other's toes." },
        { type: "keypoints", heading: "What Version Control Gives You", points: [
          "🕐 Complete history of every change ever made — travel back to any point in time.",
          "👥 Multiple people can work simultaneously without overwriting each other.",
          "🔀 Parallel development — try new ideas in isolation, merge them when ready.",
          "❓ Context for every change — the who, what, when, and why.",
          "🛡️ Fearless experimentation — break anything, revert instantly.",
        ]},
        { type: "tip", content: "The best time to start using version control is at the very beginning of a project — even if you're working alone. The second best time is right now." },
      ],
      practice: { steps: [
        { title: "Spot the chaos", desc: "Look at your own projects. Do you have files named 'final' or 'backup'? This is a sign you need Git.", command: null },
        { title: "Think about collaboration", desc: "Imagine two developers editing the same file at the same time. How would they combine their work without VCS?" },
      ]},
      quiz: [
        { question: "What is the main problem that version control solves?", options: ["Makes code run faster", "Tracks changes and enables collaboration without chaos", "Automatically writes code for you", "Compresses files to save disk space"], correct: 1, explanation: "Version control's primary purpose is tracking every change to files over time, enabling multiple people to collaborate, and providing a complete history of a project." },
        { question: "Which of these is NOT a benefit of version control?", options: ["See who made each change and why", "Travel back to any previous version", "Automatically fix bugs in your code", "Multiple people can work simultaneously"], correct: 2, explanation: "Version control tracks, manages, and merges changes — but it doesn't automatically fix bugs. That's still your job!" },
        { question: "If you have files named 'report_final_v3_REALLY_FINAL.doc', what does this indicate?", options: ["Good file organization", "You are using Git correctly", "You need version control — you're doing it manually", "The file is very important"], correct: 2, explanation: "Multiple 'final' file names are the classic symptom of manual version management — exactly the problem Git was designed to eliminate." },
        { question: "What does a Version Control System (VCS) record about each change?", options: ["Only the file names that changed", "Who changed what, when, and why (via commit messages)", "Only the date of the change", "The file size before and after"], correct: 1, explanation: "A VCS records the complete picture: the diff (what changed), the author (who), the timestamp (when), and the commit message (why)." },
        { question: "Why is version control useful even for solo developers?", options: ["It's not — it's only useful for teams", "It provides history, fearless experimentation, and backup", "It makes code run faster", "It automatically deploys your app"], correct: 1, explanation: "Even alone, you benefit from complete history, the ability to experiment fearlessly on branches, and a built-in backup of your entire project." },
      ],
    },
    2: {
      subtitle: "Git is a distributed version control system — the world's most popular time machine for code.",
      sections: [
        { type: "text", heading: "What Exactly Is Git?", content: "Git is a Distributed Version Control System (DVCS) created by Linus Torvalds in 2005 to manage the development of the Linux kernel. Before Git existed, the Linux kernel used a proprietary DVCS called BitKeeper. When the free license was revoked, Torvalds wrote Git in just 10 days. It's now used by virtually every software company on Earth." },
        { type: "analogy", content: "Git is like a save-game system for your entire project folder. Every time you 'save' (commit), Git takes a complete snapshot of what every file looks like at that moment. You can jump back to any snapshot instantly. Unlike regular saving, nothing is ever lost — every snapshot lives forever in the timeline." },
        { type: "visual_diagram", name: "distributed-vs-central" },
        { type: "text", heading: "Why Distributed Matters", content: "In a centralized system (like SVN), there's one server everyone connects to. If it goes down, work stops. In a distributed system like Git, every developer has the ENTIRE project history on their own machine. This means you can commit, branch, merge, and browse history completely offline. You only need a network connection to share changes with others." },
        { type: "keypoints", heading: "Git's Core Superpowers", points: [
          "Speed: Nearly all operations are local — no network required for most tasks.",
          "Integrity: Everything is checksummed with SHA-1. It's impossible to corrupt history without Git knowing.",
          "Non-linear development: Branches are cheap and fast — create one in milliseconds.",
          "Distributed: Every clone is a complete backup of the entire project.",
          "Open Source: Free forever, maintained by thousands of contributors worldwide.",
        ]},
        { type: "code", label: "Install Git & verify", content: `# Check if Git is installed
git --version
# Output: git version 2.42.0

# On Mac (with Homebrew)
brew install git

# On Ubuntu/Debian Linux
sudo apt-get install git

# On Windows - download from git-scm.com` },
        { type: "code", label: "First-time setup", content: `# Tell Git who you are (required before your first commit)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Set VS Code as default editor (optional but recommended)
git config --global core.editor "code --wait"

# See all your config settings
git config --list` },
        { type: "tip", content: "The --global flag saves this configuration for ALL repositories on your computer. You only need to do this once. You can override it per-project by running git config without --global inside a repository." },
      ],
      practice: { steps: [
        { title: "Install Git", desc: "Install Git for your operating system from git-scm.com or using your package manager.", command: "git --version" },
        { title: "Configure your identity", desc: "Set your name and email. These appear in every commit you make.", command: 'git config --global user.name "Your Name"' },
        { title: "Verify your config", desc: "Check that everything is saved correctly.", command: "git config --list" },
      ]},
      quiz: [
        { question: "Who created Git and why?", options: ["GitHub engineers, to build their product", "Linus Torvalds, to manage Linux kernel development", "Microsoft, to replace SVN", "Google, to improve code search"], correct: 1, explanation: "Git was created by Linus Torvalds in 2005 after the Linux kernel lost access to BitKeeper. He wrote it in about 10 days." },
        { question: "What makes Git 'distributed'?", options: ["It works on multiple operating systems", "Every developer has a complete copy of the entire repository history", "Changes are distributed automatically to all developers", "It can connect to multiple servers at once"], correct: 1, explanation: "Distributed means every clone contains the full history. You don't need a server to commit, branch, or view logs — all that happens locally." },
        { question: "Which command verifies Git is installed and shows its version?", options: ["git install", "git --version", "git check", "git info"], correct: 1, explanation: "'git --version' is the standard way to verify Git is installed and see which version you have." },
        { question: "What does 'git config --global user.email' configure?", options: ["Your GitHub account email", "The email stored in every commit you make", "Email notifications for repository changes", "Your password for remote repositories"], correct: 1, explanation: "This sets the email address associated with your commits. It's stored in commit metadata and visible to everyone who sees your commits." },
        { question: "What is the main advantage of Git being distributed over centralized VCS?", options: ["It's faster to install", "You can work completely offline and every clone is a full backup", "It has a better graphical interface", "It uses less disk space"], correct: 1, explanation: "Since every developer has the complete history locally, you can work offline, and the project is automatically backed up across every clone." },
      ],
    },
    3: {
      subtitle: "Git is the tool. GitHub is the platform that makes collaboration with Git social and powerful.",
      sections: [
        { type: "text", heading: "Git vs GitHub — Not the Same Thing!", content: "One of the most common sources of confusion for beginners: Git and GitHub are NOT the same thing. Git is a version control tool that runs on your computer. GitHub is a website (owned by Microsoft since 2018) that hosts Git repositories in the cloud and adds collaboration features on top. You can use Git without GitHub, and GitHub is not the only service of its kind (there's also GitLab, Bitbucket, and others)." },
        { type: "analogy", content: "Git is the engine of a car — it does all the real work. GitHub is the entire highway system, navigation app, gas station network, and mechanic shops that let you drive that car anywhere and share the journey with other people. The engine works without the highways, but the highways make it infinitely more useful." },
        { type: "keypoints", heading: "What GitHub Adds On Top of Git", points: [
          "☁️ Remote hosting: Your repository lives in the cloud — accessible from anywhere.",
          "👁️ Code browsing: A beautiful web interface to read and explore code.",
          "🤝 Pull Requests: A formal process for proposing, reviewing, and merging code changes.",
          "🐛 Issues: A built-in bug tracker and project management system.",
          "🔄 GitHub Actions: Automated workflows — run tests, deploy apps automatically.",
          "🌐 GitHub Pages: Host static websites directly from a repository for free.",
          "🔀 Forks: Copy any public repository to your account and experiment freely.",
        ]},
        { type: "text", heading: "Key GitHub Concepts Preview", content: "Three GitHub concepts will become your best friends as you learn more. First, Remote Repositories: your repository hosted on GitHub.com. Second, Forks: your personal copy of someone else's repository, where you can freely experiment without affecting the original. Third, Pull Requests: the mechanism for proposing that your changes be merged into another branch — the heart of all collaboration on GitHub." },
        { type: "code", label: "Creating your first GitHub repo", content: `# 1. Go to github.com and click "New repository"
# 2. Give it a name (e.g. "my-first-repo")
# 3. Leave it Public and DON'T check "Add README"
# 4. Click "Create repository"

# GitHub will then show you commands like these:
git remote add origin https://github.com/yourusername/my-first-repo.git
git branch -M main
git push -u origin main` },
        { type: "keypoints", heading: "GitHub vs GitLab vs Bitbucket", points: [
          "GitHub: Most popular, best for open source, owned by Microsoft.",
          "GitLab: Open source platform itself, better built-in CI/CD, can be self-hosted.",
          "Bitbucket: From Atlassian, integrates deeply with Jira and Confluence.",
          "All three host Git repositories — the core Git commands are identical across all of them.",
        ]},
      ],
      practice: { steps: [
        { title: "Create a GitHub account", desc: "Go to github.com and sign up for a free account. Choose a professional username — it will appear on all your commits.", command: null },
        { title: "Explore a real repository", desc: "Visit github.com/torvalds/linux to see Linus Torvalds' own Linux kernel repository — one of the largest open source projects in the world.", command: null },
        { title: "Star your first repository", desc: "Find a project you like and star it. This bookmarks it and shows appreciation to the authors.", command: null },
      ]},
      quiz: [
        { question: "What is the key difference between Git and GitHub?", options: ["They are the same thing — different names for the same product", "Git is the version control tool; GitHub is a cloud hosting service for Git repositories", "GitHub is the command-line tool; Git is the website", "Git is made by Microsoft; GitHub is open source"], correct: 1, explanation: "Git is the VCS tool that runs on your machine. GitHub is a cloud service built around Git that adds collaboration features. One is a tool, the other is a platform." },
        { question: "What is a 'Fork' on GitHub?", options: ["Splitting a branch into two branches", "Your personal copy of someone else's repository", "A merge conflict that can't be resolved", "A type of commit that undoes previous work"], correct: 1, explanation: "Forking creates your own copy of someone's repository under your account. You can freely experiment, and later propose your changes back via a Pull Request." },
        { question: "Which company owns GitHub?", options: ["Google", "Atlassian", "Microsoft", "Meta"], correct: 2, explanation: "Microsoft acquired GitHub in 2018 for $7.5 billion. Despite initial concerns, GitHub has remained largely independent and free." },
        { question: "What is a Pull Request?", options: ["A command to download code from GitHub", "A proposal to merge changes from one branch into another, with discussion and review", "A request for more disk space on GitHub servers", "A way to copy another developer's repository"], correct: 1, explanation: "A PR is a formal proposal saying 'I have changes on my branch — please review and merge them.' It's the core collaboration mechanism on GitHub." },
        { question: "Can you use Git without GitHub?", options: ["No — Git requires GitHub to work", "Yes — Git is a standalone tool that works completely without any online service", "Only for private projects", "Only on Linux"], correct: 1, explanation: "Absolutely! Git works perfectly locally on your machine. GitHub is just one of many optional services you can use to host and share your Git repositories." },
      ],
    },
    4: {
      subtitle: "The single most important mental model for understanding Git: your project lives in three places simultaneously.",
      sections: [
        { type: "text", heading: "The Most Important Concept in Git", content: "If there's one thing that will unlock your understanding of Git, it's the Three Trees model. Almost every Git command is doing something to move changes between these three areas. Once you understand this model, commands like git add, git commit, git reset, and git restore will make perfect, intuitive sense." },
        { type: "visual_diagram", name: "three-trees" },
        { type: "text", heading: "The Working Directory", content: "This is your actual project folder — the files you see and edit in VS Code or any text editor. When you modify a file, the change exists ONLY in your working directory. Git sees it as 'unstaged' or 'untracked'. Nothing is saved to Git's history yet. You could delete the change and it would be gone forever at this stage." },
        { type: "text", heading: "The Staging Area (Index)", content: "The staging area is a unique concept in Git that doesn't exist in most other VCS. It acts as a 'preview zone' or 'shopping cart' for your next commit. You explicitly choose which changes from your working directory to add here with git add. This lets you craft very precise, intentional commits even when your working directory has many unrelated changes." },
        { type: "analogy", content: "You're a photographer at a wedding. The Working Directory is the chaotic dance floor with hundreds of people. The Staging Area is when you review shots on your camera screen and carefully select the 5 best photos. The Repository is when you press 'save' — those 5 photos become permanently part of your wedding album. You can still go back and change which photos you selected (unstage them) before pressing save." },
        { type: "text", heading: "The Repository (.git directory)", content: "This is Git's database — the hidden .git folder inside your project. When you commit, the staged snapshot gets permanently stored here as a commit object. Each commit is linked to its parent, forming an unbroken chain of history going all the way back to the very first commit. This history is immutable — you can always go back." },
        { type: "code", label: "Seeing the three trees in action", content: `# Check current state of all three trees
git status

# OUTPUT might look like:
On branch main
Changes to be committed:          ← Staging Area
  (use "git restore --staged <file>..." to unstage)
        new file:   style.css

Changes not staged for commit:    ← Working Directory (modified)
  (use "git add <file>..." to update what will be committed)
        modified:   index.html

Untracked files:                  ← Working Directory (new)
  (use "git add <file>..." to include in what will be committed)
        notes.txt` },
        { type: "tip", content: "Run 'git status' compulsively. Seriously — before and after every command. It's your GPS in Git, always telling you exactly where you are and what state your files are in." },
      ],
      practice: {},
      quiz: [
        { question: "In Git's Three Trees model, where do your changes go immediately when you edit a file?", options: ["Repository", "Staging Area", "Working Directory", "Remote"], correct: 2, explanation: "When you edit a file, the change only exists in the Working Directory. It hasn't been staged or committed yet — it's just a modification on disk." },
        { question: "What does 'git add' do in terms of the Three Trees?", options: ["Moves changes from Repository to Working Directory", "Moves changes from Working Directory to Staging Area", "Moves changes from Staging Area to Repository", "Downloads changes from a remote repository"], correct: 1, explanation: "git add copies the current state of a file from the Working Directory into the Staging Area, preparing it to be included in the next commit." },
        { question: "What does 'git commit' do in terms of the Three Trees?", options: ["Moves changes from Working Directory to Staging Area", "Uploads changes to GitHub", "Takes a permanent snapshot of the Staging Area and stores it in the Repository", "Deletes old commits to save space"], correct: 2, explanation: "git commit takes everything currently in the Staging Area and stores it as a permanent snapshot (commit object) in the Repository." },
        { question: "Why is the Staging Area useful?", options: ["It makes commits faster", "It lets you selectively choose exactly which changes go into a commit, even when you have many unrelated changes", "It automatically backs up your work", "It's required by GitHub"], correct: 1, explanation: "The staging area lets you craft precise, intentional commits. You might have changed 5 files, but only want to commit 2 of them — stage exactly those 2." },
        { question: "What is 'git status' used for?", options: ["Shows the content of files", "Checks internet connection to GitHub", "Shows the current state of all three trees — what's modified, staged, and untracked", "Lists all branches in the repository"], correct: 2, explanation: "git status is your most important command for orientation. It shows you what's in the Working Directory (modified/untracked) and what's in the Staging Area (to be committed)." },
      ],
    },
    5: {
      subtitle: "The terminal is Git's native language. Learn to navigate it with confidence.",
      sections: [
        { type: "text", heading: "Why the Terminal?", content: "Git was designed as a command-line tool. While there are excellent GUI applications (like GitHub Desktop, GitKraken, VS Code's built-in Git support), the terminal is the universal language. Every developer on every operating system can use the same Git commands. GUIs hide complexity; the terminal reveals it — which is exactly what you need when learning." },
        { type: "code", label: "Essential navigation commands", content: `# Print current directory (where are you?)
pwd
# Output: /Users/yourname/projects

# List files and folders
ls          # Mac/Linux
dir         # Windows CMD
ls          # Windows PowerShell

# List with details (size, permissions, dates)
ls -la      # Mac/Linux

# Change directory
cd projects          # Go into a folder
cd ..               # Go up one level
cd ~                # Go to home directory
cd ~/projects/myapp  # Go to a specific path

# Make a new directory
mkdir my-project

# Create a new file
touch index.html     # Mac/Linux
echo > index.html    # Windows` },
        { type: "code", label: "Configuring Git for the first time", content: `# REQUIRED: Set your name (appears in every commit)
git config --global user.name "Ada Lovelace"

# REQUIRED: Set your email (use your GitHub email)
git config --global user.email "ada@example.com"

# OPTIONAL BUT RECOMMENDED: Set default branch name to "main"
git config --global init.defaultBranch main

# OPTIONAL: Set VS Code as your default editor
git config --global core.editor "code --wait"

# See everything you've configured
git config --list

# See a specific value
git config user.name` },
        { type: "keypoints", heading: "Terminal Tips That Will Save You", points: [
          "Tab completion: Start typing a command or path and press Tab — the terminal auto-completes it.",
          "Arrow up/down: Navigate through your command history without retyping.",
          "Ctrl+C: Cancel any running command or stuck process.",
          "Ctrl+L or 'clear': Clear the terminal screen.",
          "Ctrl+A: Jump to start of line. Ctrl+E: Jump to end.",
          "!! (double bang): Repeat the last command. 'sudo !!' repeats with sudo.",
        ]},
        { type: "tip", content: "You don't need to memorize every command. You just need to be comfortable navigating to a project folder and running Git commands there. Those are the only terminal skills Git truly requires." },
      ],
      practice: {},
      quiz: [
        { question: "What does the 'pwd' command do?", options: ["Changes your password", "Prints your current directory location", "Creates a new directory", "Lists all git commands"], correct: 1, explanation: "pwd stands for 'print working directory' — it shows you the full path to where you currently are in the file system." },
        { question: "How do you navigate to a folder called 'projects' using the terminal?", options: ["open projects", "ls projects", "cd projects", "git projects"], correct: 2, explanation: "'cd' stands for 'change directory'. It's your primary navigation command for moving between folders in the terminal." },
        { question: "What does 'git config --global user.name' do?", options: ["Changes your username on GitHub", "Sets the name that will appear in every commit you make on this computer", "Creates a new Git user account", "Displays a list of all Git users"], correct: 1, explanation: "This sets your display name in Git's global configuration. It's stored in every commit you create, visible to anyone who reads your project history." },
        { question: "What keyboard shortcut cycles through previous commands in the terminal?", options: ["Ctrl+H", "Tab", "Arrow Up key", "Ctrl+P"], correct: 2, explanation: "The Up arrow key navigates backward through your command history, letting you quickly re-run or edit previous commands." },
        { question: "What is the purpose of the --global flag in git config?", options: ["Applies the setting to all files in the project", "Applies the setting to all Git repositories on your computer", "Shares the setting with all team members", "Makes the setting permanent and uneditable"], correct: 1, explanation: "--global saves the configuration to your user-level config file (~/.gitconfig), applying it to every repository on your machine." },
      ],
    },
    6: {
      subtitle: "Initialize your first repository and make your first commit — your first real step into Git.",
      sections: [
        { type: "text", heading: "Creating Your First Repository", content: "A Git repository is simply a folder that Git is tracking. You can turn ANY existing folder into a Git repository in seconds with git init. Git creates a hidden .git subfolder that stores all the version history, configuration, and metadata. Deleting this folder would remove all Git history from the project, but leave your actual files untouched." },
        { type: "code", label: "Complete first repository walkthrough", content: `# Step 1: Create a project folder and navigate into it
mkdir my-first-project
cd my-first-project

# Step 2: Initialize Git
git init
# Output: Initialized empty Git repository in .../my-first-project/.git/

# Step 3: Create a file
echo "# My First Project" > README.md

# Step 4: Check status - Git sees the new file
git status
# Output shows: Untracked files: README.md

# Step 5: Stage the file
git add README.md
# Or stage EVERYTHING:  git add .

# Step 6: Check status again - now it's staged
git status
# Output shows: Changes to be committed: new file: README.md

# Step 7: Make your first commit!
git commit -m "Add README file"
# Output: [main (root-commit) a1b2c3d] Add README file
#          1 file changed, 1 insertion(+)

# Step 8: See your commit in the history
git log
git log --oneline   # Compact view` },
        { type: "keypoints", heading: "Understanding git log Output", points: [
          "commit a1b2c3d4e5f6... — The unique SHA-1 hash that identifies this exact commit forever.",
          "Author: Your Name <email> — Who made this commit (from git config).",
          "Date: Mon Oct 9 ... — When this commit was created.",
          "The commit message — Your description of what changed and why.",
        ]},
        { type: "code", label: "Checking what changed before staging", content: `# See UNSTAGED changes (working directory vs staging area)
git diff

# See STAGED changes (staging area vs last commit)
git diff --staged

# See changes in a specific file
git diff README.md

# Show all files in a commit
git show a1b2c3d` },
        { type: "tip", content: "Write commit messages in the imperative present tense — 'Add login button', not 'Added login button' or 'Adding login button'. This matches how Git itself writes messages ('Merge branch...'). A good rule: your commit message should complete the sentence 'If applied, this commit will...'" },
        { type: "warning", content: "Never commit directly to main (or master) in a team project. Always work on a feature branch. We'll cover this in Chapter 8 — for now, focus on getting comfortable with the basic commit workflow." },
      ],
      practice: {},
      quiz: [
        { question: "What does 'git init' do?", options: ["Downloads a repository from GitHub", "Creates a new commit", "Initializes a Git repository by creating a .git folder in the current directory", "Logs you into your GitHub account"], correct: 2, explanation: "git init transforms any directory into a Git repository by creating a hidden .git folder that will store all version history and configuration." },
        { question: "After running 'git init' and creating a file, what does git status show for that file?", options: ["Modified", "Staged", "Committed", "Untracked"], correct: 3, explanation: "New files that Git has never seen before show as 'Untracked'. They exist in the Working Directory but Git isn't monitoring them yet." },
        { question: "What is the correct order of operations for making a commit?", options: ["git commit → git add → git init", "git init → git commit → git add", "git init → git add → git commit", "git add → git init → git commit"], correct: 2, explanation: "The correct order: init (set up repository), then add (stage changes), then commit (save snapshot). You can skip init on subsequent commits." },
        { question: "What does the -m flag do in 'git commit -m \"message\"'?", options: ["Marks the commit as important", "Specifies the commit message inline", "Creates a merge commit", "Commits all modified files"], correct: 1, explanation: "The -m flag lets you write your commit message directly on the command line. Without it, Git opens a text editor for you to write the message." },
        { question: "What is stored in the hidden .git folder?", options: ["Your actual project files", "Your GitHub credentials", "Git's entire database: all commits, branches, configuration, and history", "Only the latest version of files"], correct: 2, explanation: "The .git folder IS Git's database for your project. It contains every commit, branch pointer, configuration setting, and the complete history of every file." },
      ],
    },
    7: {
      subtitle: "Understand exactly what happens inside Git when you commit — the Blob, Tree, and Commit objects.",
      sections: [
        { type: "text", heading: "What Really Happens When You Commit?", content: "Most tutorials teach you Git commands without explaining what they actually do internally. That leads to confusion and fear when things go wrong. Understanding Git's object model — just three types of objects — will demystify everything. Once you see how elegantly simple it is, Git will feel completely intuitive." },
        { type: "visual_diagram", name: "git-objects" },
        { type: "text", heading: "Blob: The Content Object", content: "A Blob (Binary Large Object) stores the raw content of a file. Importantly, Git does NOT store the filename in the blob — just the content. The blob is named by computing the SHA-1 hash of its content. This means two files with identical content will share the same blob, even if they have different names. SHA-1 produces a 40-character hex string like 'a1b2c3d4...' — a unique fingerprint of the content." },
        { type: "text", heading: "Tree: The Directory Object", content: "A Tree object represents a directory. It maps filenames to blob hashes (for files) or other tree hashes (for subdirectories). When you commit, Git builds a tree object for your project root, which might reference other tree objects for subdirectories, and those reference blobs for files. Trees are also named by SHA-1 hashes of their content." },
        { type: "text", heading: "Commit: The Snapshot Object", content: "A Commit object ties everything together. It contains: a pointer to the root tree (the state of all your files), the author and committer information, a timestamp, the commit message, and a pointer to its parent commit(s). The first commit has no parent. A merge commit has two parents. This chain of commits pointing back to their parents forms Git's immutable history." },
        { type: "code", label: "Inspect Git objects yourself", content: `# See all objects Git has stored
find .git/objects -type f

# Show the type of an object
git cat-file -t a1b2c3d   # "commit", "tree", or "blob"

# Show the content of an object  
git cat-file -p a1b2c3d

# Example: cat-file on a commit shows:
# tree 7c8d3f1a...
# parent 9fceb024...
# author Ada Lovelace <ada@example.com> 1697400000 +0000
# committer Ada Lovelace <ada@example.com> 1697400000 +0000
# 
# Add hero section

# Show the tree a commit points to:
git ls-tree HEAD

# Show all objects as a pretty log:
git log --pretty=format:"%H %T %P %s"` },
        { type: "keypoints", heading: "Why This Design is Brilliant", points: [
          "Content-addressed: The SHA-1 hash IS the name. Corruption is immediately detectable.",
          "Efficient storage: If a file doesn't change between commits, the new tree just re-uses the same old blob — no duplication.",
          "Atomic snapshots: A commit points to ONE root tree that captures the ENTIRE state of the project at that moment.",
          "Immutable: You can't change a committed object — changing content changes its hash, creating a new object.",
          "Branching is free: A branch is literally just a text file containing a commit hash. Creating a branch costs almost nothing.",
        ]},
        { type: "tip", content: "You'll never need to manually work with Git's object database in day-to-day use. But knowing it exists makes commands like git log, git diff, and git reset completely transparent — you can always reason about what they're doing to these objects." },
      ],
      practice: { steps: [
        { title: "Inspect your own repository", desc: "After making a few commits, explore the .git/objects directory to see Git's internal storage.", command: "find .git/objects -type f" },
        { title: "Read a commit object", desc: "Take a commit hash from git log and inspect its raw contents with cat-file.", command: "git cat-file -p <hash>" },
        { title: "Follow the chain", desc: "From a commit, look at its tree, then the blobs inside — follow the chain all the way down." },
      ]},
      quiz: [
        { question: "What are the three types of Git objects?", options: ["File, Folder, Commit", "Blob, Tree, Commit", "Stage, Commit, Push", "Add, Commit, Branch"], correct: 1, explanation: "Git's object model consists of exactly three types: Blobs (file content), Trees (directory structure), and Commits (snapshots with metadata and history)." },
        { question: "What does a Blob store?", options: ["A file's name and content", "Only the raw content of a file (not its name)", "A directory listing", "A commit message"], correct: 1, explanation: "A Blob only stores content. Filenames are stored in Tree objects. This is why two files with the same content share one Blob." },
        { question: "How is each Git object named?", options: ["Sequentially (commit-1, commit-2, etc.)", "By the filename of the file it contains", "By a SHA-1 hash of its content", "By the date it was created"], correct: 2, explanation: "Every Git object's name (identifier) is the SHA-1 hash of its content. This makes Git a content-addressable storage system." },
        { question: "If a file doesn't change between two commits, what does Git do?", options: ["Creates a new copy of the blob", "Deletes the old version", "The new tree simply re-references the same existing blob — no duplication", "Compresses the file to save space"], correct: 2, explanation: "This is key to Git's efficiency. If file content hasn't changed, the same blob hash appears in the new tree — no new blob is created." },
        { question: "What does a Commit object point to?", options: ["Only the changed files", "The root Tree object (full project snapshot) + parent commit(s) + author/message metadata", "Only the parent commit", "All the individual blobs directly"], correct: 1, explanation: "A Commit contains a pointer to ONE root tree (the entire project state), pointers to parent commit(s), plus author, date, and message metadata." },
      ],
    },
    8: {
      subtitle: "Branches let you develop features in isolation — the most powerful concept in Git's day-to-day workflow.",
      sections: [
        { type: "text", heading: "What Is a Branch?", content: "Here's the mind-blowing truth about Git branches: a branch is just a text file containing a 40-character commit hash. That's it. It's a named pointer to a specific commit. Creating a branch doesn't copy your files, doesn't create a new database, doesn't do anything expensive. It creates a ~50 byte file. This is why Git branching is instantaneous and why you should use branches for literally everything." },
        { type: "analogy", content: "Imagine a timeline of commits like a road. The main branch is the main road. Creating a new branch is like building an exit ramp — you can drive a different route, build new things along the way, and when you're ready, merge that road back into the main highway. Meanwhile, traffic on the main road continues uninterrupted." },
        { type: "code", label: "All branch commands", content: `# See all local branches (* = current branch)
git branch

# See all branches including remote-tracking
git branch -a

# Create a new branch (doesn't switch to it)
git branch feature/add-login

# Switch to a branch (new way - recommended)
git switch feature/add-login

# Switch to a branch (old way - still works)
git checkout feature/add-login

# Create AND switch in one command
git switch -c feature/add-login     # New way (recommended)
git checkout -b feature/add-login   # Old way (still common)

# Rename a branch
git branch -m old-name new-name

# Delete a branch (safe - won't delete unmerged work)
git branch -d feature/add-login

# Force delete (dangerous - deletes even if unmerged)
git branch -D feature/add-login

# See the last commit on each branch
git branch -v` },
        { type: "text", heading: "HEAD: The Special Pointer", content: "HEAD is a special pointer that tells Git which branch (and therefore which commit) you're currently working on. When you make a new commit, the current branch's pointer moves forward to the new commit, and HEAD follows along. When you switch branches with git switch, HEAD is updated to point to the new branch. Think of HEAD as 'you are here' on a map." },
        { type: "code", label: "See what HEAD points to", content: `# See where HEAD points
cat .git/HEAD
# Output: ref: refs/heads/main  ← means HEAD points to main branch

# After git switch feature/login:
cat .git/HEAD
# Output: ref: refs/heads/feature/login

# See the commit HEAD points to
git rev-parse HEAD   # Shows the full SHA-1 hash

# "Detached HEAD" state - HEAD points directly to a commit, not a branch
git checkout a1b2c3d   # HEAD is now "detached"` },
        { type: "keypoints", heading: "Branching Best Practices", points: [
          "Name branches descriptively: feature/user-auth, bugfix/login-crash, hotfix/security-patch.",
          "Create a branch for EVERY new feature or bug fix — never work directly on main.",
          "Keep branches short-lived: merge them back within days, not months.",
          "Delete branches after merging — keep your branch list clean.",
          "Use prefixes: feature/, bugfix/, hotfix/, chore/, docs/ for organization.",
        ]},
        { type: "tip", content: "The moment you start a new task — any task — create a branch first. 'git switch -c feature/what-im-about-to-do'. This 3-second habit will save you countless hours." },
      ],
      practice: {},
      quiz: [
        { question: "What is a Git branch at its core?", options: ["A complete copy of the repository", "A text file containing a commit hash — a lightweight pointer", "A folder containing all files for that feature", "An encrypted backup of the codebase"], correct: 1, explanation: "A branch is literally just a file containing a 40-character SHA-1 hash pointing to a commit. This is why creating a branch is instantaneous and costs almost nothing." },
        { question: "What does HEAD represent in Git?", options: ["The first commit in the repository", "A pointer to the branch you're currently on (your 'current position' in history)", "The latest commit on GitHub", "The branch with the most recent activity"], correct: 1, explanation: "HEAD is Git's way of knowing which commit you're working from. It typically points to a branch (which in turn points to a commit)." },
        { question: "Which command creates a new branch AND immediately switches to it?", options: ["git branch -new feature/nav", "git create feature/nav", "git switch -c feature/nav", "git branch switch feature/nav"], correct: 2, explanation: "'git switch -c' creates and switches in a single step. The older equivalent is 'git checkout -b'. Both are commonly used." },
        { question: "What naming convention is recommended for a branch fixing a login bug?", options: ["login", "fix", "bugfix/login-crash", "branch-1"], correct: 2, explanation: "Descriptive names with prefixes (feature/, bugfix/, hotfix/) make it immediately clear what a branch is for, especially in repos with many branches." },
        { question: "When is it safe to use 'git branch -d' to delete a branch?", options: ["Never — branches should be kept forever", "Only after the branch has been merged into another branch", "Anytime — it doesn't actually delete anything", "Only when HEAD is pointing to that branch"], correct: 1, explanation: "git branch -d (lowercase d) is safe — it refuses to delete a branch with unmerged commits. It succeeds once the branch's work has been merged in." },
      ],
    },
    9: {
      subtitle: "Bring your feature branch changes back into main — the full merge workflow every developer uses daily.",
      sections: [
        { type: "text", heading: "What is Merging?", content: "Merging is the process of integrating changes from one branch into another. It's the second half of the branching workflow: you branch off to work independently, then merge back when your work is done. Git is exceptionally good at automatically combining changes from different branches, even when multiple people have edited the same files in different places." },
        { type: "visual_diagram", name: "merge-types" },
        { type: "code", label: "Basic merge workflow", content: `# You're on main. You want to merge feature/add-nav into main.

# Step 1: Make sure main is up to date
git switch main
git pull    # Get latest changes from GitHub (if working with a team)

# Step 2: Merge the feature branch
git merge feature/add-nav

# Git will tell you what happened:
# Fast-forward merge:
# Updating a1b2c3d..d4e5f6g
# Fast-forward
#  nav.html | 24 ++++++++++++++++++++++++
#  1 file changed, 24 insertions(+)

# Three-way merge (creates a merge commit):
# Merge made by the 'ort' strategy.
#  nav.html | 24 ++++++++++++
#  1 file changed, 24 insertions(+)

# Step 3: Clean up by deleting the merged branch
git branch -d feature/add-nav` },
        { type: "text", heading: "Fast-Forward Merge", content: "A fast-forward merge happens when the target branch (e.g., main) has had no new commits since you branched off. In this case, Git doesn't need to create a merge commit — it simply moves main's pointer forward to your branch's latest commit. The history is a clean straight line. Git prefers fast-forward merges when possible because they create simpler history." },
        { type: "text", heading: "Three-Way Merge", content: "When both the target branch and your feature branch have made new commits since branching, they've diverged. Git must perform a three-way merge: it looks at the common ancestor commit, your branch's changes, and the target branch's changes, then intelligently combines them. Git creates a special 'merge commit' with two parents to record that history converged at this point." },
        { type: "code", label: "Merge strategies and options", content: `# Prevent fast-forward — always create a merge commit (preserves branch history)
git merge --no-ff feature/add-nav

# Squash all branch commits into one commit on main (clean history)
git merge --squash feature/add-nav
git commit -m "Add navigation feature"

# Abort a merge in progress (if you got into trouble)
git merge --abort

# See all merged branches (safe to delete)
git branch --merged

# See unmerged branches (not safe to delete)
git branch --no-merged` },
        { type: "tip", content: "For personal projects, fast-forward merges are fine. For teams, consider --no-ff to preserve the fact that work happened on a separate branch — it makes the history much easier to understand and revert if needed." },
      ],
      practice: {},
      quiz: [
        { question: "When does a fast-forward merge happen?", options: ["When there are merge conflicts", "When the target branch has had no new commits since the feature branch was created", "When merging more than two branches at once", "When using GitHub's merge button"], correct: 1, explanation: "Fast-forward is possible only when the target branch's tip IS the ancestor of the branch being merged — no new commits have been made on it since branching." },
        { question: "What is a merge commit?", options: ["A commit that undoes a previous merge", "A special commit with two parents, created when two diverged branches are combined", "A commit made directly on the main branch", "The first commit in a repository"], correct: 1, explanation: "A merge commit is created during a three-way merge. It has two parent commits — one from each branch being merged — permanently recording in history that the branches converged." },
        { question: "What does 'git merge --no-ff feature/nav' do?", options: ["Merges without fetching the latest changes", "Forces creation of a merge commit even if a fast-forward is possible", "Cancels a merge in progress", "Merges using the latest commit only"], correct: 1, explanation: "--no-ff (no fast-forward) forces Git to create a merge commit even when a fast-forward is possible. This preserves the branch topology in history." },
        { question: "After successfully merging a feature branch into main, what should you do?", options: ["Push the feature branch to GitHub and keep it", "Nothing — branches are automatically deleted", "Delete the feature branch with git branch -d", "Create a backup of the branch first"], correct: 2, explanation: "After merging, the feature branch's commits are part of main's history. The branch pointer is no longer needed — delete it to keep your repository clean." },
        { question: "What does 'git merge --squash feature/nav' do?", options: ["Deletes all commits from the feature branch", "Takes all commits from the feature branch and squashes them into the staging area for one combined commit", "Merges and immediately pushes to GitHub", "Creates a compressed backup of the branch"], correct: 1, explanation: "--squash combines all commits from the feature branch into staged changes, letting you create a single clean commit on the target branch. Great for keeping main's history clean." },
      ],
    },
    10: {
      subtitle: "Conflicts are inevitable — here's exactly how to understand and resolve them with confidence.",
      sections: [
        { type: "text", heading: "Why Merge Conflicts Happen", content: "Git is remarkably good at automatically merging changes. It can handle two people adding lines to different parts of the same file, or one person deleting a function while another adds a new one elsewhere. But when two branches modify the EXACT SAME LINES of the SAME FILE in DIFFERENT WAYS, Git reaches an impasse. It can't know which version to keep — that's a human decision." },
        { type: "analogy", content: "You and a colleague both edit the same line in a contract. You change 'the payment shall be $100' to '$150'. They change it to '$200'. Git has both versions but no way to decide which is right. It marks the conflict and asks you to resolve it. This is actually Git doing exactly the right thing — it refuses to silently choose for you." },
        { type: "code", label: "What a conflict looks like", content: `# Git tells you about the conflict:
# CONFLICT (content): Merge conflict in index.html
# Automatic merge failed; fix conflicts and then commit the result.

# Open the conflicted file. You'll see conflict markers:
<<<<<<< HEAD
<h1>Welcome to My Site</h1>
=======
<h1>Hello World</h1>
>>>>>>> feature/homepage-redesign

# <<<<<<< HEAD         = YOUR version (current branch)
# =======              = DIVIDER between the two versions
# >>>>>>> feature/...  = THEIR version (branch being merged)` },
        { type: "text", heading: "Resolving Conflicts Step by Step", content: "Resolving a conflict means: 1) Open the conflicted file in your editor, 2) Find the conflict markers (<<<<<<, =======, >>>>>>>), 3) Decide which content to keep — it might be yours, theirs, or a combination, 4) Delete all conflict markers, 5) Save the file, 6) Stage the resolved file with git add, 7) Complete the merge with git commit. That's it." },
        { type: "code", label: "Full conflict resolution workflow", content: `# Step 1: See which files have conflicts
git status
# Both modified: index.html

# Step 2: Open and edit the file to resolve the conflict
# (using VS Code, vim, nano, or any editor)
# Delete markers, keep the right content:
<h1>Welcome to My Site</h1>  ← you decided to keep your version

# Step 3: Stage the resolved file
git add index.html

# Step 4: Complete the merge
git commit
# Git auto-generates a merge commit message, just :wq to save

# Alternative: use git mergetool for a visual diff editor
git mergetool` },
        { type: "keypoints", heading: "Preventing Conflicts (Best Practices)", points: [
          "Commit frequently: Smaller, focused commits are much easier to merge.",
          "Pull before you push: Always sync with remote before starting work.",
          "Keep branches short-lived: The longer a branch lives, the more it diverges.",
          "Communicate: Tell your team which files you're working on.",
          "Use smaller functions: Large files with many collaborators = more conflicts.",
          "Merge main into your feature branch regularly (not just the other way).",
        ]},
        { type: "tip", content: "VS Code has excellent built-in conflict resolution UI. It shows 'Accept Current Change', 'Accept Incoming Change', 'Accept Both Changes' buttons right in the editor. Use it — it's much easier than editing conflict markers manually." },
        { type: "warning", content: "Never commit a file that still contains <<<<<<, =======, or >>>>>>> conflict markers. Your application will almost certainly break. Always search for these markers after resolving conflicts." },
      ],
      practice: { steps: [
        { title: "Create a conflict", desc: "Create two branches from the same commit, make conflicting changes to the same line, and merge them.", command: null },
        { title: "Identify the conflict", desc: "Run git status to see which files are conflicted.", command: "git status" },
        { title: "Resolve and commit", desc: "Edit the file, remove conflict markers, stage it, and commit.", command: "git add <file> && git commit" },
      ]},
      quiz: [
        { question: "When does a merge conflict occur?", options: ["When two people commit at the same time", "When two branches modify the exact same lines of the same file in different ways", "When there are more than 100 commits in history", "When a branch has been deleted before merging"], correct: 1, explanation: "Conflicts occur specifically when Git can't automatically determine which version to keep — two branches have made incompatible changes to the same location in a file." },
        { question: "What do the '<<<<<<<', '=======', and '>>>>>>>' markers mean in a conflict?", options: ["Syntax errors that need to be fixed in the code", "The current branch's version, the divider, and the incoming branch's version", "Git commands that need to be run to resolve the conflict", "Indicators that the file is corrupted"], correct: 1, explanation: "<<<<<<< HEAD shows your version, ======= separates the two versions, and >>>>>>> shows the incoming branch's version. You must manually resolve and remove all three markers." },
        { question: "After manually editing a conflict file to resolve it, what is the next step?", options: ["Run 'git merge --continue'", "Delete and recreate the file", "Run 'git add <file>' to mark it as resolved, then 'git commit'", "Push directly to GitHub — it auto-resolves"], correct: 2, explanation: "After resolving, you must stage the file with git add to tell Git the conflict is resolved, then git commit to complete the merge." },
        { question: "What is the best way to minimize merge conflicts in a team?", options: ["Have only one person write code at a time", "Work on short-lived branches, commit frequently, and merge from main into your branch regularly", "Never use branches — commit everything directly to main", "Always use git merge --no-ff"], correct: 1, explanation: "Conflicts happen when branches diverge for too long. Short-lived branches with frequent merges from main keep branches close to current state and minimize conflicts." },
        { question: "What does 'git merge --abort' do?", options: ["Deletes all changes and the repository", "Cancels the merge and returns everything to the state before the merge started", "Skips all conflicts and merges automatically", "Aborts and deletes the source branch"], correct: 1, explanation: "git merge --abort is your escape hatch — if a merge goes wrong or you're not ready to resolve conflicts, this returns your working directory to the pre-merge state." },
      ],
    },
    11: {
      subtitle: "Connect your local repository to GitHub and start syncing your work with the world.",
      sections: [
        { type: "text", heading: "Local vs Remote", content: "So far, everything has happened on your computer. Your repository, your commits, your branches — all local. A remote repository is a version of your project hosted on a server (like GitHub). You can have multiple remotes, but by convention the main one is called 'origin'. Connecting local to remote lets you back up your work, share it, and collaborate." },
        { type: "code", label: "Connecting to GitHub", content: `# Add a remote (tell your local repo about GitHub)
git remote add origin https://github.com/username/repo-name.git

# Verify it was added
git remote -v
# origin  https://github.com/username/repo-name.git (fetch)
# origin  https://github.com/username/repo-name.git (push)

# Push your local main branch to GitHub for the first time
# -u sets up tracking (future 'git push' knows where to go)
git push -u origin main

# After the first push, just:
git push    # Pushes current branch to its tracked remote

# Pull changes that others have pushed to GitHub
git pull

# Pull = fetch + merge (two separate steps if you want):
git fetch origin   # Download changes but don't apply yet
git merge origin/main  # Apply the downloaded changes` },
        { type: "text", heading: "Cloning an Existing Repository", content: "If you want to work on a project that already exists on GitHub, you use git clone instead of git init. Clone downloads the entire repository — all history, all branches — and automatically sets up the 'origin' remote for you. It's the starting point for contributing to any project." },
        { type: "code", label: "Clone and explore", content: `# Clone a repository to your machine
git clone https://github.com/username/repo-name.git

# Clone into a specific folder name
git clone https://github.com/username/repo.git my-folder

# After cloning, origin is already set up:
git remote -v
# origin  https://github.com/username/repo.git (fetch)
# origin  https://github.com/username/repo.git (push)

# See all remote-tracking branches
git branch -r
# origin/main
# origin/feature/login

# Track a remote branch locally
git switch -c feature/login origin/feature/login` },
        { type: "keypoints", heading: "fetch vs pull — The Difference", points: [
          "git fetch: Downloads all changes from remote but does NOT modify your working files. Safe to run anytime.",
          "git pull: Runs git fetch AND then git merge — downloads and immediately applies changes to your current branch.",
          "Best practice: Use git fetch to see what changed, then git merge (or git rebase) when you're ready.",
          "In practice: Most developers just use git pull when they're ready to sync — it's fine for most workflows.",
        ]},
        { type: "warning", content: "If you git push and get a rejection error, it means someone else pushed new commits while you were working. Run 'git pull' first to integrate their changes, then push again. Never use 'git push --force' on a shared branch — it overwrites their work." },
      ],
      practice: { steps: [
        { title: "Create a GitHub repository", desc: "Go to github.com, click New, name it, create it without any initial files.", command: null },
        { title: "Add the remote", desc: "Copy the repository URL from GitHub and add it as origin.", command: "git remote add origin <url>" },
        { title: "Push your work", desc: "Push your local main branch and set up tracking.", command: "git push -u origin main" },
        { title: "Verify on GitHub", desc: "Refresh the GitHub page — your commits should be visible!" },
      ]},
      quiz: [
        { question: "What does 'git remote add origin <url>' do?", options: ["Creates a new repository on GitHub", "Tells your local repository about a remote repository and names it 'origin'", "Pushes all commits to the specified URL", "Downloads a repository from the URL"], correct: 1, explanation: "This command adds a named shortcut ('origin') pointing to the remote URL. Git stores this so you can use 'origin' instead of the full URL in future commands." },
        { question: "What does 'git push -u origin main' do?", options: ["Downloads the main branch from GitHub", "Pushes local main to GitHub and sets up tracking (so future git push knows where to go)", "Creates a new remote branch called main", "Merges the remote main into local main"], correct: 1, explanation: "The -u flag (--set-upstream) establishes tracking between your local main and origin/main. After this, 'git push' alone knows to push to origin main." },
        { question: "What is the difference between 'git fetch' and 'git pull'?", options: ["They're identical commands", "fetch downloads changes without applying them; pull downloads AND merges", "fetch is for branches; pull is for files", "pull is faster than fetch"], correct: 1, explanation: "git fetch safely downloads remote changes without touching your working files. git pull = git fetch + git merge. Use fetch when you want to review changes before merging." },
        { question: "What does 'git clone' do?", options: ["Creates a backup copy of your local repository", "Downloads an existing remote repository (with full history) and sets up origin automatically", "Copies one branch to another", "Duplicates all commits into a new branch"], correct: 1, explanation: "git clone downloads the complete repository including all commits, branches, and history, and automatically configures 'origin' pointing to the source URL." },
        { question: "What should you do if 'git push' is rejected with 'Updates were rejected'?", options: ["Use git push --force to override", "Delete and re-clone the repository", "Run git pull to integrate others' changes first, then push", "Create a new branch and push that instead"], correct: 2, explanation: "A push rejection means the remote has commits you don't have locally. Pull first to integrate those changes, resolve any conflicts, then push. Never force-push shared branches." },
      ],
    },
    12: {
      subtitle: "The industry-standard Git workflow used by millions of developers at companies around the world.",
      sections: [
        { type: "text", heading: "What is GitHub Flow?", content: "GitHub Flow is a lightweight, branch-based workflow created by GitHub and used by millions of developers. It has only one rule to rule them all: anything in the main branch is deployable at any time. Everything else follows naturally from that single principle. It's simple enough for beginners, yet powerful enough for large teams." },
        { type: "keypoints", heading: "The 6 Steps of GitHub Flow", points: [
          "1️⃣ Create a branch: git switch -c feature/your-feature — descriptively named off main.",
          "2️⃣ Make commits: Work in small, focused commits. Push the branch to GitHub regularly.",
          "3️⃣ Open a Pull Request: Signal you're ready for feedback even before the feature is done.",
          "4️⃣ Discuss & Review: Team members review code, leave comments, suggest changes.",
          "5️⃣ Deploy & Test: Some teams deploy the feature branch to staging for testing.",
          "6️⃣ Merge: Once approved, merge into main — which is now immediately deployable.",
        ]},
        { type: "code", label: "GitHub Flow in practice", content: `# === Starting a new feature ===
git switch main
git pull                           # Get latest main
git switch -c feature/user-profile # Create feature branch

# === Doing the work ===
# ... edit files ...
git add .
git commit -m "Add user profile page layout"
# ... more work ...
git add .
git commit -m "Add profile picture upload"

# === Push branch to GitHub and open PR ===
git push -u origin feature/user-profile
# Now go to GitHub — it shows a button "Open Pull Request"

# === After PR is approved and merged on GitHub ===
git switch main
git pull                           # Get the freshly merged changes
git branch -d feature/user-profile # Clean up local branch
git push origin --delete feature/user-profile  # Clean up remote branch` },
        { type: "text", heading: "Other Workflows: GitFlow", content: "GitHub Flow isn't the only workflow. GitFlow is more complex, designed for projects that have scheduled releases. It uses two permanent branches (main and develop) plus three types of temporary branches (feature, release, hotfix). It's powerful but more rigid. For most modern teams doing continuous deployment, GitHub Flow is preferred because of its simplicity." },
        { type: "keypoints", heading: "Writing Great Commit Messages", points: [
          "First line: 50 characters max, imperative tense ('Add login', not 'Added login')",
          "Blank line between subject and body (optional, for complex commits)",
          "Body: Why was this change made? What problem does it solve?",
          "Reference issues: 'Fixes #123' automatically closes GitHub issue #123",
          "Don't explain WHAT changed (the diff shows that) — explain WHY",
        ]},
        { type: "tip", content: "For a team, protect your main branch on GitHub: Settings → Branches → Add rule → Require pull request reviews. This enforces the GitHub Flow and prevents anyone from pushing directly to main, no matter their permissions." },
      ],
      practice: { steps: [
        { title: "Create a feature branch", desc: "Pull latest main and create a descriptively named branch.", command: "git switch -c feature/add-contact-form" },
        { title: "Make commits", desc: "Make small, focused changes and commit them with clear messages.", command: 'git commit -m "Add contact form HTML structure"' },
        { title: "Push and open a PR", desc: "Push the branch to GitHub, then open a Pull Request from the GitHub interface.", command: "git push -u origin feature/add-contact-form" },
      ]},
      quiz: [
        { question: "What is the core rule of GitHub Flow?", options: ["Always use merge commits — never rebase", "The main branch is always deployable", "Every developer must have their own fork", "Commit messages must be written in past tense"], correct: 1, explanation: "The one non-negotiable rule of GitHub Flow is that main is always in a deployable state. This forces discipline and ensures rapid deployability." },
        { question: "In GitHub Flow, when should you open a Pull Request?", options: ["Only when the feature is 100% complete and tested", "Never — push directly to main", "As soon as you have something to discuss, even in-progress work", "Only after getting permission from the team lead"], correct: 2, explanation: "PRs are not just for finished work — they're collaboration tools. Opening one early invites feedback, enables discussion, and keeps the team informed." },
        { question: "What is the correct first step before creating a feature branch?", options: ["Delete all other branches first", "git push to sync your local work", "git switch main && git pull — get the latest main", "Create the PR on GitHub first"], correct: 2, explanation: "Always start from an up-to-date main. If you branch from an outdated main, your feature will miss recent changes and cause larger conflicts when merging." },
        { question: "What does 'Fixes #123' in a commit message do on GitHub?", options: ["Nothing — it's just a comment", "Automatically closes GitHub Issue #123 when the commit is merged into main", "Creates a new issue numbered 123", "Links to a specific line in a file"], correct: 1, explanation: "GitHub recognizes keywords like 'Fixes #', 'Closes #', 'Resolves #' in commit messages and PRs — they automatically close the referenced issue when merged." },
        { question: "How does GitFlow differ from GitHub Flow?", options: ["GitFlow is simpler with one main branch; GitHub Flow has many permanent branches", "GitFlow uses two permanent branches (main + develop) and is designed for scheduled releases; GitHub Flow is simpler for continuous deployment", "They are identical — different names for the same workflow", "GitHub Flow is for open source; GitFlow is for private repos"], correct: 1, explanation: "GitFlow is more complex with separate develop, release, hotfix, and feature branches designed for versioned software. GitHub Flow's simplicity makes it better for continuous deployment." },
      ],
    },
    13: {
      subtitle: "Pull Requests are Git's collaboration superpower — code review, discussion, and history in one place.",
      sections: [
        { type: "text", heading: "What Is a Pull Request?", content: "A Pull Request (PR) is a request for someone to review and merge your code changes. It's called a 'pull' request because you're asking the project maintainers to 'pull' your changes into their branch. On GitHub, a PR is much more than just a merge button — it's a rich conversation thread where your code is reviewed line-by-line, discussed, improved, and finally approved." },
        { type: "keypoints", heading: "Anatomy of a Great Pull Request", points: [
          "Clear title: 'Add user authentication' not 'Fix stuff' or 'WIP'",
          "Description: What does this PR do? Why? How was it tested? Any screenshots?",
          "Small and focused: One PR = one feature or bug fix. Easier to review, less conflict risk.",
          "Tests included: Reviewers need to know your changes don't break anything.",
          "Link to issue: 'Closes #42' connects the PR to the relevant issue.",
          "Draft PRs: Use 'Draft' status for work in progress — signals not ready for review.",
        ]},
        { type: "code", label: "PR workflow from command line", content: `# 1. Create and push your branch
git switch -c feature/user-authentication
# ... do work, make commits ...
git push -u origin feature/user-authentication

# 2. GitHub CLI (gh) to open a PR from terminal
gh pr create --title "Add user authentication" \\
  --body "This PR adds JWT-based user auth.\\nCloses #42" \\
  --base main

# 3. Check PR status
gh pr status
gh pr list

# 4. After PR is approved, merge from GitHub UI
# OR from CLI:
gh pr merge 42 --merge   # Regular merge
gh pr merge 42 --squash  # Squash merge  
gh pr merge 42 --rebase  # Rebase merge

# 5. Clean up
git switch main
git pull
git branch -d feature/user-authentication` },
        { type: "text", heading: "The Forking Workflow (Open Source)", content: "For open source projects where you don't have write access to the main repository, you use the Fork workflow. First, fork the repository (creates your own copy on GitHub). Clone YOUR fork, make changes, push to your fork. Then open a PR from your fork's branch to the original repository's main branch. The original maintainers can then review and merge your contribution." },
        { type: "code", label: "Fork workflow for open source", content: `# 1. Fork on GitHub (click Fork button on the repo page)

# 2. Clone YOUR fork
git clone https://github.com/YOUR-USERNAME/project.git
cd project

# 3. Add the original as "upstream" (to get future updates)
git remote add upstream https://github.com/ORIGINAL-OWNER/project.git
git remote -v
# origin    https://github.com/YOUR/project.git (your fork)
# upstream  https://github.com/ORIGINAL/project.git (original)

# 4. Create a branch, make changes, push to YOUR fork
git switch -c fix/typo-in-readme
# ... make changes ...
git push origin fix/typo-in-readme

# 5. Open PR on GitHub: from your fork's branch → original repo's main

# 6. Keep your fork updated with upstream
git fetch upstream
git switch main
git merge upstream/main
git push origin main` },
        { type: "tip", content: "When reviewing someone else's PR, be specific and kind. Instead of 'this is wrong', say 'I think we could improve performance here by using X — what do you think?' Great code review is about the code, not the person." },
      ],
      practice: { steps: [
        { title: "Open your first PR", desc: "Push a feature branch and open a Pull Request on GitHub. Fill in a clear title and description.", command: null },
        { title: "Review the Files Changed tab", desc: "Look at the diff GitHub shows you. This is exactly what will be merged.", command: null },
        { title: "Fork an open source repo", desc: "Find a beginner-friendly open source project (search 'good first issue' on GitHub) and fork it.", command: null },
      ]},
      quiz: [
        { question: "Why is it called a 'Pull Request'?", options: ["You pull the latest code before opening it", "You're requesting the maintainers to pull (merge) your changes into their branch", "GitHub pulls your changes automatically", "You pull from a remote repository to create it"], correct: 1, explanation: "A PR is a request saying 'please pull my changes into your branch'. The word 'pull' here means merge — pull the changes from my branch into yours." },
        { question: "What is the Forking Workflow used for?", options: ["Working with teams who all have write access", "Contributing to projects where you don't have write access (like open source)", "Creating multiple copies of a project for testing", "Merging without creating a PR"], correct: 1, explanation: "Forking lets you contribute to projects you don't own. You fork → clone your fork → make changes → push to your fork → open PR to the original repo." },
        { question: "What does 'upstream' typically refer to in a fork workflow?", options: ["Your local main branch", "The original repository you forked from", "The most recent commit in your fork", "Your fork on GitHub"], correct: 1, explanation: "By convention, 'upstream' refers to the original repository. 'origin' is your fork. Keeping your fork's main in sync with upstream is important for staying current." },
        { question: "What makes a good Pull Request?", options: ["As many changes as possible in one PR", "Small, focused changes with a clear title, description, and linked issue", "PRs should be merged immediately without review", "Use cryptic commit messages to save time"], correct: 1, explanation: "Small, focused PRs are easier to review, understand, and revert if needed. Clear descriptions and linked issues give reviewers context." },
        { question: "What is a Draft Pull Request?", options: ["A PR that has been rejected", "A PR that is marked as work-in-progress, not ready for final review", "A private PR only visible to you", "A PR from a forked repository"], correct: 1, explanation: "Draft PRs signal 'I'm still working on this — feedback welcome but don't merge yet.' They're great for early collaboration and visibility without premature merging." },
      ],
    },
    14: {
      subtitle: "Rewrite, clean up, and perfect your local history before sharing it with your team.",
      sections: [
        { type: "text", heading: "Why Rewrite History?", content: "Real development is messy. You make a typo fix in one commit, then fix your typo-fix in the next. You make 15 small commits that all logically belong together. Before sharing this history with your team, you can clean it up to tell a coherent story. The tools in this chapter are for cleaning local history before it's shared — never rewrite history that others already have." },
        { type: "code", label: "git commit --amend", content: `# Amend the very last commit's message
git commit --amend -m "Correct commit message"

# Add forgotten files to the last commit (without changing message)
git add forgotten-file.js
git commit --amend --no-edit

# What amend actually does:
# It REPLACES the last commit with a new one (new hash)
# The old commit is discarded
# Only use this BEFORE pushing to a shared repository!` },
        { type: "code", label: "Interactive Rebase — the power tool", content: `# Rewrite the last 4 commits interactively
git rebase -i HEAD~4

# This opens your editor with something like:
pick a1b2c3d Add login page
pick b2c3d4e Fix typo
pick c3d4e5f Fix typo again
pick d4e5f6g Fix final typo

# Change 'pick' to:
# s (squash) - combine with previous commit
# r (reword) - change the commit message
# d (drop)   - delete this commit entirely
# e (edit)   - pause and amend this commit
# f (fixup)  - like squash but discard the message

# Example: squash all into one clean commit:
pick a1b2c3d Add login page
s b2c3d4e Fix typo
s c3d4e5f Fix typo again
s d4e5f6g Fix final typo

# After saving, Git replays commits, pausing as needed
# You'll get to write one clean combined commit message` },
        { type: "warning", content: "THE GOLDEN RULE: Never rebase commits that have been pushed to a shared branch. If others have already pulled those commits, rewriting them creates a divergent history that breaks their repositories. Rebase is ONLY for local, unshared commits." },
        { type: "code", label: "Other history-rewriting tools", content: `# Stash: temporarily save work without committing
git stash              # Save current changes to a temporary stack
git stash pop          # Restore the most recent stash
git stash list         # See all stashes
git stash apply stash@{2}  # Apply a specific stash

# Cherry-pick: apply a specific commit from another branch
git cherry-pick a1b2c3d    # Apply commit a1b2c3d to current branch

# Rebase onto another branch (cleaner than merge)
git rebase main            # Replay current branch commits on top of main` },
        { type: "tip", content: "git stash is incredibly useful when you're in the middle of work and suddenly need to switch branches to fix an urgent bug. Stash your work, fix the bug, pop your stash back." },
      ],
      practice: { steps: [
        { title: "Amend a commit", desc: "Make a commit, then realize you forgot a file. Add it and amend.", command: "git commit --amend --no-edit" },
        { title: "Interactive rebase", desc: "Make 3 messy commits, then use interactive rebase to squash them into one clean commit.", command: "git rebase -i HEAD~3" },
        { title: "Use git stash", desc: "Start editing files, stash the work, switch branches, then pop the stash back.", command: "git stash && git switch main" },
      ]},
      quiz: [
        { question: "What does 'git commit --amend' do?", options: ["Creates a new commit after the current one", "Replaces the last commit with a new one (changing its hash)", "Undoes the last commit completely", "Adds a tag to the last commit"], correct: 1, explanation: "--amend creates a new commit object that replaces the last commit. It's great for fixing the message or adding forgotten files, but changes the commit hash." },
        { question: "In an interactive rebase, what does 's' (squash) do?", options: ["Stops the rebase", "Skips the commit", "Combines this commit with the previous one", "Saves the commit without changes"], correct: 2, explanation: "Squash combines a commit with the one above it, letting you merge multiple small commits into one cohesive commit." },
        { question: "What is THE GOLDEN RULE of rebasing?", options: ["Always rebase instead of merging", "Never rebase commits that have been pushed to a shared branch", "Rebase at least once per day", "Only rebase commits from today"], correct: 1, explanation: "Rebasing rewrites commit hashes. If others have already based work on those commits, rewriting them creates a nightmare divergence. Only rebase local, unshared commits." },
        { question: "What does 'git stash' do?", options: ["Permanently deletes uncommitted changes", "Saves uncommitted changes to a temporary stack so you can work with a clean working directory", "Creates a new branch for the changes", "Pushes changes to GitHub for safekeeping"], correct: 1, explanation: "git stash saves your Work In Progress to a stack and resets your working directory to the last commit. Use git stash pop to restore the saved changes." },
        { question: "What is 'git cherry-pick' used for?", options: ["Selecting which files to include in a commit", "Applying a specific commit from one branch onto another branch", "Picking the best branch to merge", "Filtering commits by date"], correct: 1, explanation: "cherry-pick takes a specific commit (by hash) and applies it to your current branch, creating a new commit with the same changes but a different hash." },
      ],
    },
    15: {
      subtitle: "Git is designed for safety — here's how to undo almost any mistake at any stage.",
      sections: [
        { type: "text", heading: "Git's Safety Net", content: "One of Git's greatest features is that almost nothing is truly permanent. If you made a mistake, Git almost certainly has a way to undo it. The key is knowing WHAT you want to undo and WHEN you want to undo it — because the right tool depends on whether the change is in your working directory, staging area, or already committed." },
        { type: "code", label: "Undoing at every stage", content: `# ======================================
# 1. UNDO UNSTAGED CHANGES (Working Directory)
# ======================================
# Discard changes to a specific file (PERMANENT - can't undo this!)
git restore index.html

# Discard ALL unstaged changes (PERMANENT!)
git restore .

# ======================================
# 2. UNDO STAGED CHANGES (Staging Area → Working Directory)
# ======================================
# Unstage a file (keeps changes in working directory)
git restore --staged index.html

# Unstage everything
git restore --staged .

# ======================================
# 3. UNDO THE LAST COMMIT (keep changes)
# ======================================
# Move HEAD back one commit, keep changes unstaged
git reset HEAD~1

# Move HEAD back one commit, keep changes STAGED
git reset --soft HEAD~1

# ======================================
# 4. SAFELY UNDO A PUSHED COMMIT
# ======================================
# Create a new commit that reverses a past commit (SAFE for shared repos)
git revert a1b2c3d   # Creates a new "reverse" commit
git revert HEAD      # Revert the most recent commit` },
        { type: "keypoints", heading: "reset vs revert — When to Use Which", points: [
          "git reset: REWRITES history. Use ONLY on local, unpushed commits. Changes commit hashes.",
          "git revert: Creates a new commit that UNDOES a previous commit. Safe for shared/pushed history.",
          "Rule: If the commit is already on a shared branch — ONLY use revert. Never reset shared history.",
          "git restore: Only affects working directory and staging area — never touches commit history.",
        ]},
        { type: "code", label: "The reflog — Git's secret safety net", content: `# git reflog records EVERY move of HEAD — your ultimate safety net
git reflog
# Output:
# a1b2c3d (HEAD -> main) HEAD@{0}: commit: Add login
# b2c3d4e HEAD@{1}: checkout: moving from feature to main
# c3d4e5f HEAD@{2}: commit: Add header
# d4e5f6g HEAD@{3}: rebase: finish rebase of feature

# "I accidentally deleted a branch!" - recover it with reflog!
git reflog           # Find the hash of the branch tip
git switch -c recovered-branch d4e5f6g

# "I did git reset --hard and lost commits!" - recover them!
git reflog           # Find the commit hash
git reset --hard a1b2c3d   # Jump back to it` },
        { type: "tip", content: "git reflog is your ultimate panic button. It records every single place HEAD has been, including commits that appear 'deleted' by reset or rebase. If you think you've lost work in Git, check the reflog first — the data is almost always still there (for about 90 days)." },
      ],
      practice: { steps: [
        { title: "Unstage a file", desc: "Stage a file, then unstage it without losing the changes.", command: "git restore --staged <file>" },
        { title: "Undo a commit (soft)", desc: "Make a commit, then undo it while keeping the changes staged.", command: "git reset --soft HEAD~1" },
        { title: "Revert a shared commit", desc: "Use git revert to safely undo a commit by creating a new reverse commit.", command: "git revert HEAD" },
      ]},
      quiz: [
        { question: "You staged a file accidentally. How do you unstage it while keeping your changes?", options: ["git reset --hard", "git restore --staged <file>", "git delete --staged <file>", "git checkout HEAD <file>"], correct: 1, explanation: "git restore --staged moves the file from the Staging Area back to the Working Directory without deleting the changes you made." },
        { question: "What is the safe way to undo a commit that has already been pushed to a shared branch?", options: ["git reset HEAD~1", "git rebase -i to drop the commit", "git revert <commit-hash>", "git push --force to overwrite the remote"], correct: 2, explanation: "git revert creates a new commit that undoes the changes of a previous commit. This doesn't rewrite history — it adds to it — making it safe for shared branches." },
        { question: "What is git reflog?", options: ["A detailed commit log with file diffs", "A record of every place HEAD has been, including commits that seem lost", "The history of merges in the repository", "A log of all git push and pull operations"], correct: 1, explanation: "The reflog is your ultimate safety net — it records every move of HEAD, letting you recover commits deleted by reset, lost branches, and more. Data stays for ~90 days." },
        { question: "What does 'git reset --soft HEAD~1' do?", options: ["Permanently deletes the last commit and its changes", "Moves HEAD back one commit, keeping changes staged and ready to recommit", "Moves HEAD back one commit and unstages all changes", "Resets the working directory to match the last commit"], correct: 1, explanation: "--soft moves the branch pointer back but keeps all changes in the Staging Area. Perfect for when you committed too soon and want to add more changes to it." },
        { question: "What is the key difference between 'git reset' and 'git revert'?", options: ["reset is slower than revert", "reset rewrites history (not safe for shared), revert creates a new undo-commit (safe for shared)", "revert only works on the latest commit", "reset is for files, revert is for branches"], correct: 1, explanation: "reset rewrites Git history (changes commit hashes), making it unsafe for branches others have. revert is additive — it adds a new commit that undoes the old one, safe anywhere." },
      ],
    },
    16: {
      subtitle: "Commands for exploring history, comparing changes, and debugging — the tools every senior developer lives in.",
      sections: [
        { type: "text", heading: "Exploring History Like a Detective", content: "Git stores your complete project history forever. The detective toolkit lets you interrogate that history — find who wrote what, when a bug was introduced, what changed between versions, and why decisions were made. These commands separate beginners from experienced Git users." },
        { type: "code", label: "git log — Beautiful history views", content: `# Basic log
git log

# Compact one-line view
git log --oneline

# Visual branch graph (the best view)
git log --oneline --graph --all

# Filter by author
git log --author="Ada Lovelace"

# Filter by date
git log --since="2 weeks ago"
git log --after="2024-01-01" --before="2024-06-01"

# Filter by commit message
git log --grep="login"

# Show commits that changed a specific file
git log -- path/to/file.js

# Show commits that changed a specific function
git log -S "functionName"    # (pickaxe search)

# Show stats for each commit (files changed, insertions, deletions)
git log --stat

# Show full diff for each commit
git log -p` },
        { type: "code", label: "git diff — Compare versions", content: `# Changes in working directory (not yet staged)
git diff

# Changes in staging area (staged but not committed)
git diff --staged

# Difference between two branches
git diff main..feature/login

# Difference between two commits
git diff a1b2c3d b2c3d4e

# Only show file names that changed (not content)
git diff --name-only main..feature

# Word-level diff (great for prose and config files)
git diff --word-diff` },
        { type: "code", label: "git blame — Find who wrote every line", content: `# Show who last modified each line of a file
git blame index.html

# Output format:
# a1b2c3d4 (Ada Lovelace 2024-01-15 14:23:11 +0000 42) <h1>Hello</h1>
#  ^commit    ^author        ^date/time                ^line ^content

# Blame for a specific range of lines
git blame -L 10,25 index.html

# Show commit info for a specific line (then dig deeper)
git show a1b2c3d4` },
        { type: "code", label: "git bisect — Binary search for bugs", content: `# The scenario: "This bug didn't exist 2 months ago. When was it introduced?"
# git bisect performs a BINARY SEARCH through your commits to find it.

# Start bisecting
git bisect start

# Tell Git the current state is BAD (bug exists)
git bisect bad

# Tell Git a known-good state (2 months ago)
git bisect good v2.0.0   # or use a commit hash

# Git checks out the midpoint commit.
# Test if the bug exists. Tell Git:
git bisect good   # or:
git bisect bad

# Repeat until Git says:
# a1b2c3d is the first bad commit

# Always end bisecting when done
git bisect reset` },
        { type: "tip", content: "git log -S 'functionName' (the 'pickaxe' option) is incredibly powerful. It finds every commit that added or removed the string 'functionName'. Perfect for finding when a function was deleted, renamed, or introduced." },
      ],
      practice: { steps: [
        { title: "View the visual graph", desc: "Run the visual log command to see all your branches as a beautiful ASCII graph.", command: "git log --oneline --graph --all" },
        { title: "Blame a file", desc: "Run git blame on any file to see who last touched each line and when.", command: "git blame <filename>" },
        { title: "Try bisect", desc: "If you have a bug in your project, try using git bisect to find exactly when it was introduced." },
      ]},
      quiz: [
        { question: "What does 'git log --oneline --graph --all' show?", options: ["A list of all files in the repository", "A visual ASCII graph of all commits and branches in the entire repository", "All commits from all contributors", "The diff of every commit"], correct: 1, explanation: "--oneline shows compact one-line commits, --graph draws ASCII art branch lines, --all includes commits from all branches (not just current)." },
        { question: "What does 'git blame' show?", options: ["A list of files you accidentally broke", "For each line of a file: which commit last modified it, by whom, and when", "A comparison between two branches", "All commits with error messages"], correct: 1, explanation: "git blame annotates every line of a file with commit hash, author, and date of the last change to that line — invaluable for understanding code history." },
        { question: "What is git bisect used for?", options: ["Dividing a large repository into smaller ones", "Performing a binary search through commits to find which one introduced a bug", "Bisecting a merge conflict into two parts", "Creating two branches from one commit"], correct: 1, explanation: "bisect uses binary search — marking commits as 'good' or 'bad' — to find the exact commit where a bug was introduced, minimizing the number of commits to test." },
        { question: "What does 'git diff --staged' show?", options: ["Changes between the staging area and the remote", "Changes between the staging area and the last commit (what would be committed)", "Changes between two committed versions", "Changes in files that haven't been staged yet"], correct: 1, explanation: "git diff --staged (or --cached) shows what's in the Staging Area compared to the last commit — exactly what will go into your next commit." },
        { question: "What does 'git log -S \"functionName\"' do?", options: ["Searches commit messages for 'functionName'", "Finds commits where 'functionName' was added or removed from any file", "Shows the log starting from a function", "Searches file names for 'functionName'"], correct: 1, explanation: "The -S option is the 'pickaxe' — it searches the actual diff content for a string, finding commits that added or removed that exact string from any file." },
      ],
    },
    17: {
      subtitle: "Keep secrets, binaries, and clutter out of your repository with .gitignore.",
      sections: [
        { type: "text", heading: "What Should Never Go in Git?", content: "Git is designed to track source code, not everything on your computer. Certain files should never be committed: generated files that can be recreated (node_modules, build output), environment-specific configuration (local .env files), secrets and credentials (API keys, passwords), large binary files (compiled executables, videos), and personal editor settings (.vscode, .idea)." },
        { type: "code", label: "Creating a .gitignore file", content: `# Create .gitignore in the root of your project
touch .gitignore

# Open it and add patterns — one per line:

# Ignore node_modules folder (npm dependencies)
node_modules/

# Ignore all .log files
*.log

# Ignore the .env file (contains secrets!)
.env
.env.local
.env.production

# Ignore build output directories
dist/
build/
.next/

# Ignore OS-specific files
.DS_Store       # Mac
Thumbs.db       # Windows

# Ignore editor config
.vscode/
.idea/

# Ignore compiled files
*.class
*.pyc
__pycache__/

# Except! Negate a rule with !
!important.log  # Track this specific .log file even though *.log is ignored` },
        { type: "code", label: "Useful .gitignore patterns", content: `# Pattern matching reference:
*.txt       # Ignore ALL .txt files anywhere
doc/*.txt   # Ignore .txt files only in /doc folder
doc/**/*.txt # Ignore .txt files in /doc and all subdirectories

# Specific file
secrets.json

# Specific directory (trailing slash = directory only)
temp/

# Everything except one file in an ignored folder
node_modules/*
!node_modules/important-package

# Already tracked? Must stop tracking first:
git rm --cached .env          # Stop tracking (remove from git, keep file)
git rm -r --cached node_modules/  # Stop tracking a directory

# Check if a file is being ignored and WHY
git check-ignore -v filename.txt` },
        { type: "warning", content: "If you accidentally committed a secret (API key, password) — change the secret IMMEDIATELY. A simple git rm --cached is not enough because the secret still lives in Git history. You'll need to rewrite history with tools like BFG Repo-Cleaner or git filter-branch. Prevention is vastly easier than cure." },
        { type: "keypoints", heading: "Global .gitignore", points: [
          "Create ~/.gitignore_global to ignore files across ALL your repositories.",
          "git config --global core.excludesFile ~/.gitignore_global activates it.",
          "Put OS files (.DS_Store, Thumbs.db) and editor configs here — not in project .gitignore.",
          "gitignore.io generates ready-made .gitignore files for any language or framework.",
        ]},
        { type: "tip", content: "Add .gitignore as one of the very first commits in any new project — before you accidentally commit node_modules or .env. Many project templates (create-react-app, Next.js, etc.) include a sensible .gitignore automatically." },
      ],
      practice: { steps: [
        { title: "Create a .gitignore", desc: "In your project, create .gitignore and add patterns for your framework.", command: "touch .gitignore" },
        { title: "Generate one automatically", desc: "Visit gitignore.io and generate a .gitignore for React + Node", command: null },
        { title: "Untrack an already-tracked file", desc: "If you accidentally committed .env, stop tracking it without deleting it.", command: "git rm --cached .env" },
      ]},
      quiz: [
        { question: "What does a .gitignore file do?", options: ["Deletes files from the repository", "Tells Git to not track files matching the specified patterns", "Hides files from other developers", "Encrypts sensitive files before committing"], correct: 1, explanation: ".gitignore tells Git to ignore (not track) files matching the patterns you specify. Ignored files don't appear in 'git status' and can't be accidentally committed." },
        { question: "You want to ignore all .log files BUT track one specific 'important.log'. How?", options: ["Create separate .gitignore for each folder", "Use two patterns: '*.log' then '!important.log'", "This is impossible in .gitignore", "Rename the file to .logimportant"], correct: 1, explanation: "The '!' character negates a pattern — it's an exception rule. '*.log' ignores all log files, then '!important.log' exempts that specific file from being ignored." },
        { question: "Which of these should DEFINITELY be in .gitignore?", options: ["index.html", "README.md", "package.json", ".env (environment file with API keys)"], correct: 3, explanation: ".env files often contain secrets like API keys, database passwords, etc. They should NEVER be committed to version control — add .env to .gitignore immediately." },
        { question: "You accidentally committed node_modules. How do you stop tracking it without deleting it?", options: ["Delete the folder and commit", "git rm -r --cached node_modules/ then add it to .gitignore", "git ignore node_modules/", "git reset --hard to before the commit"], correct: 1, explanation: "git rm --cached removes files from Git's tracking WITHOUT deleting them from disk. After this, add the pattern to .gitignore and commit the removal." },
        { question: "What does .gitignore ONLY affect?", options: ["All files, including already-tracked ones", "Only new and untracked files — already-tracked files are NOT affected", "Only files in the current directory", "Only files pushed to GitHub"], correct: 1, explanation: ".gitignore only prevents UNTRACKED files from being added. Files Git is already tracking will continue to be tracked — you must use 'git rm --cached' to stop tracking them." },
      ],
    },
    18: {
      subtitle: "Everything comes together: build, version-control, collaborate on, and deploy a real React app.",
      sections: [
        { type: "text", heading: "The Final Project: Your Portfolio App", content: "You now know everything about Git and GitHub. In this chapter, we bring it all together by building a real React portfolio site, version-controlling it with Git, collaborating via GitHub, and deploying it live to the internet with GitHub Pages — for free. This is exactly the workflow used at real companies." },
        { type: "code", label: "Step 1: Initialize the React project", content: `# Create a new React app (using Vite — the modern way)
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install

# Initialize Git (NOTE: Vite/CRA already include .gitignore!)
git init
git add .
git commit -m "Initialize React portfolio with Vite"

# Start the dev server to see it working
npm run dev` },
        { type: "code", label: "Step 2: Create repo on GitHub & connect", content: `# On GitHub: Create new repo named "my-portfolio" 
# (no README, no .gitignore — we have them already)

# Connect and push
git remote add origin https://github.com/YOUR-USERNAME/my-portfolio.git
git branch -M main
git push -u origin main` },
        { type: "code", label: "Step 3: Feature branch workflow", content: `# Create a branch for each section of the portfolio
git switch -c feature/hero-section

# Edit src/App.jsx to add your hero section
# ... develop the feature ...

git add src/App.jsx src/components/Hero.jsx
git commit -m "Add hero section with animated headline"

# Push branch and open PR
git push -u origin feature/hero-section
# → Go to GitHub → Open Pull Request → Merge → Delete branch

# Back on main
git switch main
git pull

# Repeat for each section:
git switch -c feature/projects-section
git switch -c feature/contact-form` },
        { type: "code", label: "Step 4: Deploy with GitHub Pages", content: `# Install the GitHub Pages deploy tool
npm install gh-pages --save-dev

# In package.json, add these:
{
  "homepage": "https://YOUR-USERNAME.github.io/my-portfolio",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"   // use 'build' for CRA
  }
}

# Deploy!
npm run deploy
# This builds the app and pushes it to a 'gh-pages' branch
# Your site is now LIVE at:
# https://YOUR-USERNAME.github.io/my-portfolio` },
        { type: "code", label: "Step 5: GitHub Actions for CI/CD", content: `# Create .github/workflows/deploy.yml
# This automatically deploys every time you push to main!

name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist` },
        { type: "keypoints", heading: "What You've Mastered", points: [
          "✅ Version control fundamentals and Git's internal model",
          "✅ The Three Trees: working directory, staging area, repository",
          "✅ Branching, merging, and conflict resolution",
          "✅ Remote repositories and syncing with GitHub",
          "✅ The GitHub Flow and Pull Requests",
          "✅ Advanced tools: rebase, stash, cherry-pick, bisect, reflog",
          "✅ History exploration and debugging with git log, blame, diff",
          "✅ Keeping repositories clean with .gitignore",
          "✅ Real-world deployment with GitHub Pages and Actions",
        ]},
        { type: "tip", content: "The best way to get better at Git is to use it every day. Start all your projects — even small ones — with git init. Commit frequently. Create branches always. Within a month, Git will feel completely natural." },
      ],
      practice: { steps: [
        { title: "Create your React app", desc: "Initialize a new React project and make your first commit.", command: "npm create vite@latest my-portfolio -- --template react" },
        { title: "Build with branches", desc: "Add at least 3 features using separate branches and PRs.", command: null },
        { title: "Deploy it live", desc: "Use gh-pages to deploy your portfolio to GitHub Pages.", command: "npm run deploy" },
      ]},
      quiz: [
        { question: "Which package is used to deploy a React app to GitHub Pages?", options: ["github-deploy", "gh-pages", "react-deploy", "vite-pages"], correct: 1, explanation: "The 'gh-pages' npm package automates the process of building your React app and pushing the built files to a special 'gh-pages' branch that GitHub Pages serves." },
        { question: "What does GitHub Actions automate?", options: ["Writing code automatically", "Workflows like testing, building, and deploying — triggered by events like pushing to main", "Managing pull request reviews", "Generating commit messages"], correct: 1, explanation: "GitHub Actions is a CI/CD platform that runs automated workflows based on events (like pushing to main). Common uses: run tests on every PR, deploy when main is updated." },
        { question: "What is the correct order for starting a new portfolio feature with GitHub Flow?", options: ["Write code → git init → git commit → create branch", "Create branch → write code → commit → push → open PR", "Push to main → open PR → create branch → write code", "Write code → push directly to main → review"], correct: 1, explanation: "Always: create branch first → do work → commit → push → open PR. Never work directly on main in a team setting (or solo for practice)." },
        { question: "Where does 'npm run deploy' push the built React files?", options: ["The main branch", "A separate 'gh-pages' branch that GitHub Pages serves automatically", "A CDN provided by npm", "A special releases section of the repository"], correct: 1, explanation: "gh-pages builds the app and pushes static files to a 'gh-pages' branch. GitHub Pages is configured to serve from this branch, making the site live." },
        { question: "What does the 'predeploy' script in package.json do?", options: ["Backs up the project before deployment", "Automatically runs before 'deploy' — typically runs npm run build to generate the production files", "Previews the deployment before it goes live", "Sends a notification to the team before deploying"], correct: 1, explanation: "npm 'pre' scripts run automatically before their matching script. 'predeploy' runs before 'deploy', ensuring the production build is fresh before gh-pages uploads it." },
      ],
    },
  };
  return chapters[id] || chapters[1];
}


export { getChapterContent };
