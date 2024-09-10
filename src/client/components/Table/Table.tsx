import { Table, Skeleton } from '@mantine/core'
import classes from './Table.module.css'
import cx from 'clsx'
import { getLeagueSrc } from '../../utils/rankingHelper'

export function RankingTable({ data, loading }) {
    const rows = data?.map((row, index) => {
        if (row.ratingLast) {
            const { btag, ratingLast, race, leagueTypeLast } = row
            return (
                <Table.Tr key={btag}>
                    <Table.Td>
                        {row?.positionChangeIndicator + ' ' + (index + 1)}
                    </Table.Td>
                    <Table.Td>{btag}</Table.Td>
                    <Table.Td>{ratingLast}</Table.Td>
                    <Table.Td>
                        <img
                            className={classes.rank}
                            src={getLeagueSrc(leagueTypeLast)}
                        ></img>
                    </Table.Td>
                    <Table.Td
                        className={cx('', {
                            [classes.zerg]: race == 'ZERG',
                            [classes.terran]: race == 'TERRAN',
                            [classes.protoss]: race == 'PROTOSS',
                        })}
                    >
                        {/* First letter cooler */}
                        {race[0]}
                    </Table.Td>
                </Table.Tr>
            )
        }
    })

    return (
        <Skeleton
            className={classes.skeleton}
            h={1000}
            visible={loading}
            maw={700}
            miw={250}
        >
            <Table
                verticalSpacing={'3'}
                striped
                stickyHeader
                highlightOnHover
                stripedColor="dark"
                maw={700}
                miw={250}
            >
                <Table.Thead className={classes.header}>
                    <Table.Tr>
                        <Table.Th>Top</Table.Th>
                        <Table.Th>Btag</Table.Th>
                        <Table.Th>MMR</Table.Th>
                        <Table.Th>Rank</Table.Th>
                        <Table.Th>Race</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Skeleton>
    )
}
