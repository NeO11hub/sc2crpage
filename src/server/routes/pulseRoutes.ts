import { Router, Request, Response } from 'express'
import { getDailySnapshot, getTop, searchPlayer } from '../services/pulseApi'
import { formatData } from '../utils/formatData'
import { uploadFile } from '../middleware/fbFileManagement'
import { getClientInfo } from '../utils/getClientInfo'

const router = Router()

router.get('/top/:daysAgo', async (req: Request, res: Response) => {
    const daysAgo = req.params.daysAgo
    const userAgent = req.headers['user-agent']
	const { device, os } = getClientInfo(userAgent)
    const details = {
        referer: req.headers.referer,
        device,
		os,
		ip: req.headers['x-forwarded-for'] || req.ip
    }

    console.log('\nGetting live ranking data')
    console.log('INFO: ', details)
    const rankingData = await getTop(daysAgo)
    const formattedData = await formatData(rankingData, 'ranking')
    res.json(formattedData)
})

router.get('/search', async (req: Request, res: Response) => {
    const term = req.query.term
    const userAgent = req.headers['user-agent']
    const { device, os } = getClientInfo(userAgent)
    const details = {
        referer: req.headers.referer,
        query: term,
        device,
		os,
		ip: req.headers['x-forwarded-for'] || req.ip
    }
    console.log('INFO:', details)

    const playerData = await searchPlayer(term)
    const formattedData = await formatData(playerData, 'search')
    res.json(formattedData)
})

router.get('/snapshot', async (req: Request, res: Response) => {
    const snapshotRanking = await getDailySnapshot()
    if (!snapshotRanking) res.json(null)
    const formattedData = {}
    for (const [key, value] of Object.entries(snapshotRanking)) {
        if (key != 'expiry') {
            formattedData[key] = await formatData(value, 'ranking')
        } else {
            formattedData[key] = value
        }
    }

    res.json(formattedData)
})

router.post('/upload', async (req: Request, res: Response) => {
    const { fileBase64, fileName, fileExtension } = req.body

    if (!fileBase64 || !fileName || !fileExtension) {
        return res.status(400).json({ error: 'Invalid data' })
    }

    // TODO: Separete firebase path selection in util files
    let contentType = ''
    let location = ''

    if (fileExtension == 'csv') {
        location = 'ranked_players/' + fileName
        contentType = 'text/csv'
    }

    if (fileExtension == 'SC2Replay') {
        location = 'replays/' + fileName
        contentType = 'application/octet-stream'
    }

    const buffer = Buffer.from(fileBase64, 'base64')

    try {
        await uploadFile(buffer, location, contentType)
        res.status(200).json({ status: 'uploaded' })
    } catch (error) {
        console.error('Error uploading file:', error)
        res.status(500).json({ status: 'error', error: error.message })
    }
})

// router.get('/download/:filename', async (req: Request, res: Response) => {
// 	console.log(req.params)
// 	const fileName = req.params.filename
// 	res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
// 	res.setHeader('Content-Type', 'application/octet-stream')
//     try {
//         const readStream = await downloadFile(fileName)
//         readStream.pipe(res)
//     } catch (err) {
//         console.error('Download failed:', err)
//         res.status(500).send('Failed to download file')
//     }
// })

export default router
