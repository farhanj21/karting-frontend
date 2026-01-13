# Deployment Guide

Complete guide for deploying the Karting Analysis Dashboard to production.

## Overview

The system consists of two parts:
1. **Python Scraper** (GitHub Actions) - Scrapes RaceFacer and syncs to MongoDB
2. **Next.js Dashboard** (Vercel) - Displays the data

## Phase 1: MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Verify your email

### 2. Create a Cluster

1. Click "Build a Database"
2. Select **FREE** (M0 Sandbox)
3. Choose a cloud provider and region (closest to you)
4. Name your cluster (e.g., "karting-analysis")
5. Click "Create"

### 3. Create Database User

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `karting-admin` (or your choice)
5. Password: Generate a secure password (save this!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Whitelist IP Addresses

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IPs (Vercel, GitHub Actions)
5. Click "Confirm"

### 5. Get Connection String

1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/karting-analysis?retryWrites=true&w=majority
   ```
5. Replace `<username>` with your database username
6. Replace `<password>` with your password
7. Save this connection string - you'll need it for both the scraper and dashboard

## Phase 2: Initial Data Sync

### 1. Set Up Python Scraper

In the `sportzilla-laptime-analysis` repository:

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Configure MongoDB Connection

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your connection string:

```env
MONGODB_URI=mongodb+srv://karting-admin:YOUR_PASSWORD@cluster.mongodb.net/karting-analysis
```

### 3. Run Initial Sync

```bash
python sync_to_mongodb.py
```

This will:
- Read CSV files from both tracks
- Calculate tiers, percentiles, and statistics
- Upload ~5,300+ records to MongoDB

Verify in MongoDB Atlas:
- Go to "Collections"
- You should see 3 collections: `tracks`, `drivers`, `laprecords`

## Phase 3: Deploy Next.js Dashboard to Vercel

### 1. Prepare Repository

```bash
cd karting-dashboard

# Initialize git if not already done
git init
git add .
git commit -m "Initial dashboard commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/karting-dashboard.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `karting-dashboard` repository
5. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Add Environment Variables

In the Vercel project settings, add:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `NEXT_PUBLIC_APP_URL` | Leave empty for now |

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Once deployed, copy your Vercel URL (e.g., `https://karting-dashboard.vercel.app`)

### 5. Update Environment Variables

1. Go to Vercel project settings > Environment Variables
2. Edit `NEXT_PUBLIC_APP_URL`
3. Set value to your Vercel URL
4. Redeploy (go to Deployments > click ... > Redeploy)

### 6. Test Your Dashboard

1. Visit your Vercel URL
2. You should see the home page with 2 track cards
3. Click on a track to view the leaderboard
4. Test search and filters

## Phase 4: Automate Data Updates (GitHub Actions)

### 1. Add GitHub Secret

In the `sportzilla-laptime-analysis` repository:

1. Go to Settings > Secrets and variables > Actions
2. Click "New repository secret"
3. Name: `MONGODB_URI`
4. Value: Your MongoDB connection string
5. Click "Add secret"

### 2. Enable GitHub Actions

The workflow file is already created at `.github/workflows/scrape-and-sync.yml`

1. Go to the "Actions" tab in your GitHub repository
2. If prompted, click "I understand my workflows, go ahead and enable them"

### 3. Test Manual Run

1. Go to Actions tab
2. Select "Scrape and Sync to MongoDB" workflow
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"
6. Wait for completion (~5-10 minutes)

### 4. Verify Automatic Schedule

The workflow is set to run every 6 hours automatically:
- 12:00 AM
- 6:00 AM
- 12:00 PM
- 6:00 PM

You can check the Actions tab to see scheduled runs.

## Phase 5: Custom Domain (Optional)

### 1. Add Domain to Vercel

1. Go to Vercel project settings > Domains
2. Enter your domain (e.g., `karting.yourdomain.com`)
3. Follow DNS configuration instructions

### 2. Configure DNS

Add records to your DNS provider:
- Type: `CNAME`
- Name: `karting` (or your subdomain)
- Value: `cname.vercel-dns.com`

### 3. Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` with your custom domain and redeploy.

## Monitoring and Maintenance

### Check Data Updates

**MongoDB Atlas:**
- Go to Collections > tracks
- Check `stats.lastUpdated` field for recent timestamp

**GitHub Actions:**
- Go to Actions tab
- Verify scheduled runs are succeeding
- Check logs for any errors

**Vercel:**
- Go to Dashboard > Analytics
- Monitor traffic and errors
- Check function logs for API errors

### Troubleshooting

**Scraper Fails:**
- Check GitHub Actions logs
- Verify CSV files exist in repository
- Ensure MongoDB connection string is correct in secrets

**Dashboard Shows No Data:**
- Verify MongoDB connection in Vercel logs
- Check that collections have data in MongoDB Atlas
- Ensure collection names match in Mongoose models

**Build Fails:**
- Check Vercel build logs
- Verify all dependencies are in package.json
- Ensure environment variables are set

## Cost Breakdown

- **MongoDB Atlas M0**: FREE (512 MB storage)
- **Vercel Hobby**: FREE (100 GB bandwidth, unlimited projects)
- **GitHub Actions**: FREE (2,000 minutes/month for public repos)

**Total Monthly Cost**: $0 (Free tier)

## Scaling Recommendations

If you exceed free tiers:

**MongoDB**: Upgrade to M10 cluster ($57/month) for:
- 10 GB storage
- Better performance
- Auto-scaling

**Vercel**: Upgrade to Pro ($20/month) for:
- Unlimited bandwidth
- Advanced analytics
- Better support

**GitHub Actions**: Use scheduled job less frequently (every 12 hours instead of 6)

## Security Best Practices

1. **Never commit** `.env` or `.env.local` files
2. **Rotate secrets** every 90 days
3. **Use read-only** database credentials for the dashboard if possible
4. **Enable 2FA** on MongoDB Atlas, Vercel, and GitHub
5. **Monitor logs** for unusual activity

## Success Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Initial data sync completed successfully
- [ ] Dashboard deployed to Vercel
- [ ] Environment variables configured
- [ ] Home page displays track cards
- [ ] Leaderboards load with data
- [ ] Search and filters work
- [ ] Charts render correctly
- [ ] GitHub Actions workflow configured
- [ ] Manual workflow run successful
- [ ] Scheduled runs enabled

## Support

If you encounter issues:
1. Check the troubleshooting sections in this guide
2. Review error logs (Vercel, GitHub Actions, MongoDB Atlas)
3. Verify all environment variables are correct
4. Ensure MongoDB collections have data

Happy racing! 🏎️
