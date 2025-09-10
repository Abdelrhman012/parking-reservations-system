import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ZoneCard from '@/components/ZoneCard'
import type { Zone } from '@/types/api'

function makeZone(overrides: Partial<Zone> = {}): Zone {
    return {
        id: 'zone_1',
        name: 'Zone 1',
        categoryId: 'cat_regular',
        gateIds: ['gate_1'],
        totalSlots: 10,
        occupied: 5,
        free: 5,
        reserved: 1,
        availableForVisitors: 3,
        availableForSubscribers: 5,
        rateNormal: 10,
        rateSpecial: 20,
        open: true,
        ...overrides,
    }
}

// مساعد صغير يلاقي زرار "Go" أو "Check-in"
function getActionButton() {
    const btn =
        screen.queryByRole('button', { name: /check[\s-]?in/i }) ||
        screen.queryByRole('button', { name: /go/i })
    if (!btn) {
        // fallback: أول زرار في الكارد
        const all = screen.getAllByRole('button')
        return all[0]
    }
    return btn
}

describe('ZoneCard', () => {
    test('disables the action button when unavailable', () => {
        const zone = makeZone({ open: false, availableForVisitors: 0 })
        const onCheckin = jest.fn()

        render(
            <ZoneCard
                special={false}
                zone={zone}
                mode="visitor"
                onCheckin={onCheckin}
                disabled={!zone.open || zone.availableForVisitors <= 0}
            />
        )

        const btn = getActionButton()
        expect(btn).toBeDisabled()
    })

    test('enables the action button and calls onCheckin with zone id', async () => {
        const user = userEvent.setup()
        const zone = makeZone({ open: true, availableForVisitors: 2 })
        const onCheckin = jest.fn()

        render(
            <ZoneCard
                special={false}
                zone={zone}
                mode="visitor"
                onCheckin={onCheckin}
                disabled={!zone.open || zone.availableForVisitors <= 0}
            />
        )

        const btn = getActionButton()
        expect(btn).toBeEnabled()

        await user.click(btn)
        expect(onCheckin).toHaveBeenCalledTimes(1)
        expect(onCheckin).toHaveBeenCalledWith(zone.id)
    })
})
