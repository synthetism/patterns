/** 
 * SupabaseRealtimeService implements the RealtimeService interface 
 * Works with any RealtimeProvider and RealtimeChannel implementation
 */

import type {
	SupabaseClient,
	RealtimePostgresDeletePayload,
	RealtimePostgresInsertPayload,
	RealtimePostgresUpdatePayload,
	RealtimeChannel,
} from "@supabase/supabase-js"
import type { RealtimeService } from "@synet/patterns/realtime"
import type { DbEvent, DbEventType } from "~/domain/events/db-events" //Event Emitter 
import { EventEmitter } from "@synet/patterns"

interface WithId {
	id: string
	[key: string]: unknown
}

export class SupabaseRealtimeService implements RealtimeService<DbEvent, RealtimeChannel> {
	private eventEmitter: EventEmitter<DbEvent>
	private activeChannels: Map<string, RealtimeChannel> = new Map()

	constructor(private supabase: SupabaseClient) {
		this.eventEmitter = new EventEmitter<DbEvent>()
	}

	getEventEmitter(): EventEmitter<DbEvent> {
		return this.eventEmitter
	}

	initializeSubscriptions(entities: string[]) {
		this.cleanup()

		// Set up subscriptions for each entity
		for (const entity of entities) {
			this.subscribeToEntity(entity)
		}
	}

	subscribeToEntity<T extends WithId>(entityName: string): RealtimeChannel {
		const channelName = `${entityName}-changes`
		const entityNameLower = entityName.toLowerCase()

		// Check if already subscribed

		if (this.activeChannels.has(channelName)) {
			const channel = this.activeChannels.get(channelName)
			if (channel) return channel
		}

		const channel = this.supabase
			.channel(`${entityName}-changes`)
			.on("postgres_changes", { event: "*", schema: "public", table: entityName }, (payload) => {
				try {
					if (payload.eventType === "INSERT") {
						const data = (payload as RealtimePostgresInsertPayload<T>).new

						// Emit event through the EventEmitter
						this.eventEmitter.emit({
							type: `${entityNameLower}.insert` as DbEventType,
							payload: data,
						})
					} else if (payload.eventType === "UPDATE") {
						const data = (payload as RealtimePostgresUpdatePayload<T>).new

						// Emit event through the EventEmitter
						this.eventEmitter.emit({
							type: `${entityNameLower}.update` as DbEventType,
							payload: data,
						})
					} else if (payload.eventType === "DELETE" && payload.old) {
						// For DELETE, we may only need the ID
						const deletePayload = payload as RealtimePostgresDeletePayload<{ id: string }>
						if (deletePayload.old.id) {
							// Emit event through the EventEmitter
							this.eventEmitter.emit({
								type: `${entityNameLower}.delete` as DbEventType,
								payload: { id: deletePayload.old.id },
							})
						}
					}
				} catch (error) {
					console.error(`Error in realtime listener for ${entityName}:`, error)
				}
			})
			.subscribe()

		this.activeChannels.set(entityNameLower, channel)

		return channel
	}

	unsubscribe(channel: RealtimeChannel) {
		this.supabase.removeChannel(channel)
	}

	cleanup() {
		for (const channel of this.activeChannels.values()) {
			this.supabase.removeChannel(channel)
		}
		this.activeChannels.clear()
	}
}
