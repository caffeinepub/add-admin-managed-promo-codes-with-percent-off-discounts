# Falcon IDs - Complete Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Backend Deployment (Internet Computer)](#backend-deployment-internet-computer)
5. [Frontend Deployment (cPanel Static Hosting)](#frontend-deployment-cpanel-static-hosting)
6. [Configuration Reference](#configuration-reference)
7. [Verification Steps](#verification-steps)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Falcon IDs is a full-stack application built on the Internet Computer platform:
- **Backend**: Motoko smart contract (canister) running on the Internet Computer
- **Frontend**: React single-page application that can be hosted on any static web server

This guide explains how to deploy both components for production use.

---

## Architecture

### Important: Backend Hosting Requirements

**The Motoko backend CANNOT run on cPanel or traditional web hosting platforms.**

The backend is a smart contract (canister) that must be deployed to the Internet Computer blockchain because:
- Motoko canisters require the Internet Computer's runtime environment
- They execute in a WebAssembly-based execution environment
- They use Internet Computer-specific features (stable memory, inter-canister calls, etc.)
- Traditional hosting platforms like cPanel, AWS, or DigitalOcean cannot execute Motoko code

### How the Frontend Connects to the Backend

The static frontend (hosted on cPanel) communicates with the backend canister (hosted on the Internet Computer) via HTTPS:

