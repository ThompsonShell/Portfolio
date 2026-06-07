"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";

interface HistoryLine {
    type: "prompt" | "output" | "comment";
    text: string;
}

const COMMANDS: Record<string, (args: string[]) => string> = {
    echo: (args) => args.join(" "),
    whoami: () => "thompson",
    pwd: () => "/home/thompson",
    date: () => new Date().toLocaleString(),
    uname: (args) => args.includes("-a") ? "Linux shell 6.1.0 x86_64 GNU/Linux" : "Linux",
    hostname: () => "shell",
    ls: (args) => {
        const files: Record<string, string> = {
            "~": "Documents  Downloads  projects  .bashrc  .zshrc",
            "/home/thompson": "Documents  Downloads  projects  .bashrc  .zshrc",
            "/": "bin  boot  dev  etc  home  lib  tmp  usr  var",
        };
        return files[args[0] || "~"] || "file1.txt  file2.py  README.md  main.go";
    },
    cat: (args) => {
        if (!args[0]) return "cat: missing file operand";
        const files: Record<string, string> = {
            ".bashrc": 'export PATH="$HOME/bin:$PATH"\nalias ll="ls -la"',
            "README.md": "# ThompsonShell\nPortfolio va ta'lim platformasi",
            "main.go": 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
        };
        return files[args[0]] || `cat: ${args[0]}: No such file or directory`;
    },
    clear: () => "__CLEAR__",
    help: () => "Mavjud buyruqlar: echo, whoami, pwd, date, uname, hostname, ls, cat, clear, help, psql, python3, node, git, env, uptime, df, free",
    psql: (args) => {
        if (args.includes("--version")) return "psql (PostgreSQL) 16.2";
        return "psql: connection refused\nIshora: psql --version bilan versiyani tekshiring";
    },
    python3: (args) => {
        if (args.includes("--version")) return "Python 3.12.3";
        return "Python 3.12.3 (interactive mode disabled in this demo)";
    },
    node: (args) => {
        if (args.includes("--version") || args.includes("-v")) return "v20.11.0";
        return "Node.js v20.11.0 (interactive mode disabled)";
    },
    git: (args) => {
        if (!args[0]) return "usage: git <command>";
        if (args[0] === "status") return "On branch main\nnothing to commit, working tree clean";
        if (args[0] === "--version") return "git version 2.43.0";
        if (args[0] === "log" || args[0] === "log --oneline") return "a1b2c3d feat: add lecture terminal\nf4e5d6a fix: video player progress\n9g8h7i6 initial commit";
        return `git: '${args[0]}' is not a git command`;
    },
    env: () => 'USER=thompson\nHOME=/home/thompson\nSHELL=/bin/zsh\nLANG=en_US.UTF-8\nTERM=xterm-256color',
    uptime: () => " 14:32:07 up 42 days, 3:15,  1 user,  load average: 0.12, 0.08, 0.05",
    df: () => "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       256G   84G  172G  33% /",
    free: () => "              total        used        free      shared\nMem:          16Gi       6.2Gi       8.1Gi       512Mi",
};

export default function TerminalUI() {
    const [history, setHistory] = useState<HistoryLine[]>([
        { type: "comment", text: "# Lecture bilan birga amaliyot" },
        { type: "comment", text: "# Buyruqlar: echo, ls, cat, help, clear va boshqalar" },
    ]);
    const [input, setInput] = useState("");
    const [cmdHistory, setCmdHistory] = useState<string[]>([]);
    const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
    const bodyRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTo(0, bodyRef.current.scrollHeight);
        }
    }, [history]);

    const executeCommand = (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        setCmdHistory((prev) => [trimmed, ...prev]);
        setCmdHistoryIdx(-1);

        const newHistory: HistoryLine[] = [
            ...history,
            { type: "prompt", text: trimmed },
        ];

        const parts = trimmed.split(/\s+/);
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        const handler = COMMANDS[command];
        if (handler) {
            const result = handler(args);
            if (result === "__CLEAR__") {
                setHistory([]);
                setInput("");
                return;
            }
            if (result) {
                newHistory.push({ type: "output", text: result });
            }
        } else {
            newHistory.push({ type: "output", text: `zsh: command not found: ${command}` });
        }

        setHistory(newHistory);
        setInput("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            executeCommand(input);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const newIdx = Math.min(cmdHistoryIdx + 1, cmdHistory.length - 1);
            setCmdHistoryIdx(newIdx);
            if (cmdHistory[newIdx]) setInput(cmdHistory[newIdx]);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const newIdx = cmdHistoryIdx - 1;
            if (newIdx < 0) {
                setCmdHistoryIdx(-1);
                setInput("");
            } else {
                setCmdHistoryIdx(newIdx);
                setInput(cmdHistory[newIdx] || "");
            }
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            setHistory([]);
        }
    };

    return (
        <div
            className="bg-black border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[500px]"
            onClick={() => inputRef.current?.focus()}
        >
            {/* Terminal Header */}
            <div className="bg-[#1A1A1A] px-4 py-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>
                <div className="text-[11px] font-mono text-white/40 tracking-widest uppercase">
                    thompson — zsh
                </div>
                <div className="w-12" />
            </div>

            {/* Terminal Body */}
            <div ref={bodyRef} className="p-4 font-mono text-[13px] leading-relaxed overflow-y-auto flex-1 custom-scrollbar">
                {history.map((line, i) => (
                    <div key={i} className="mb-1">
                        {line.type === "comment" && (
                            <div className="text-white/30">{line.text}</div>
                        )}
                        {line.type === "prompt" && (
                            <div>
                                <span className="text-[#27C93F]">thompson@shell</span>
                                <span className="text-white/50 mx-1">~</span>
                                <span className="text-[#27C93F]">%</span>
                                <span className="text-white ml-2">{line.text}</span>
                            </div>
                        )}
                        {line.type === "output" && (
                            <div className="text-white/60 whitespace-pre-wrap">{line.text}</div>
                        )}
                    </div>
                ))}

                {/* Active prompt */}
                <div className="flex items-center">
                    <span className="text-[#27C93F]">thompson@shell</span>
                    <span className="text-white/50 mx-1">~</span>
                    <span className="text-[#27C93F]">%</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 ml-2 bg-transparent text-white outline-none border-none font-mono text-[13px] caret-[#27C93F]"
                        spellCheck={false}
                        autoFocus
                    />
                    {!input && (
                        <div className="w-2 h-5 bg-[#27C93F] ml-0 animate-pulse" />
                    )}
                </div>
            </div>
        </div>
    );
}
