# Falcon IDs - Self-Hosting Guide for cPanel

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Building the Frontend](#building-the-frontend)
5. [Uploading to cPanel](#uploading-to-cpanel)
6. [Configuration](#configuration)
7. [Verification Steps](#verification-steps)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Falcon IDs is a full-stack application with two components:
- **Backend**: Motoko smart contract running on the Internet Computer (already deployed)
- **Frontend**: React static files that you can host on your cPanel server

This guide shows you how to host the frontend on your shared hosting server.

---

## Architecture

### Important: What Runs Where

**✅ Frontend (cPanel)**: The React application (HTML, CSS, JavaScript files) can be hosted on any static web server, including cPanel shared hosting.

**❌ Backend (Internet Computer ONLY)**: The Motoko backend CANNOT run on cPanel or traditional web hosting. It must remain deployed on the Internet Computer blockchain.

### How It Works

Your cPanel-hosted frontend communicates with the Internet Computer backend via HTTPS:

